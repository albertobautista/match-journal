"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Trophy,
  ArrowRight,
  Sigma,
  BadgeCheck,
  Goal,
  Landmark,
  Users,
  Percent,
} from "lucide-react";

import type { StoredMatch } from "@/lib/matches-storage";
import { getCompetitionLabel } from "@/lib/competitions";
import type { TeamOption } from "@/lib/teams";
import { getAppSettings } from "@/lib/app-settings";

type MoneyCurrency = "MXN" | "USD" | "EUR";

function startOfTodayLocal() {
  const now = new Date();
  // Use UTC to avoid timezone shift
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function parseISODate(date: string, time?: string) {
  // Extraer solo la parte YYYY-MM-DD si viene un ISO timestamp completo
  const dateOnly = date.includes("T") ? date.split("T")[0] : date;
  const [y, m, d] = dateOnly.split("-").map((x) => Number(x));
  const safeTime = time && time.trim() ? time.trim() : "00:00";
  const [h, min] = safeTime.split(":").map((x) => Number(x));
  // Use UTC to avoid timezone shift
  return new Date(Date.UTC(y, m - 1, d, h, min, 0));
}

function formatDateShort(date: string) {
  // Extraer solo la parte YYYY-MM-DD si viene un ISO timestamp completo
  const dateOnly = date.includes("T") ? date.split("T")[0] : date;
  const [y, m, d] = dateOnly.split("-").map((x) => Number(x));
  if (!y || !m || !d) return date;
  // Format without timezone interpretation
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${d} ${months[m - 1]}`;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function groupCount(arr: (string | undefined)[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const x of arr.filter(Boolean) as string[]) {
    map.set(x, (map.get(x) ?? 0) + 1);
  }
  return map;
}

function topNFromMap<T>(map: Map<T, number>, n: number): Array<[T, number]> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400">{title}</div>
          <div className="mt-1 text-3xl font-semibold text-zinc-100">
            {value}
          </div>
          <div className="mt-1 text-xs text-zinc-400">{subtitle}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const [items, setItems] = React.useState<StoredMatch[]>([]);
  const [teams, setTeams] = React.useState<TeamOption[]>([]);
  const [favoriteTeamId, setFavoriteTeamId] = React.useState<string | null>(
    null
  );
  const nowYear = String(new Date().getFullYear());

  React.useEffect(() => {
    const loadData = async () => {
      const settings = getAppSettings();
      setFavoriteTeamId(settings.favoriteTeamId);

      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch("/api/matches", { cache: "no-store" }),
          fetch("/api/teams", { cache: "no-store" }),
        ]);

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setItems(matchesData);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    loadData();
  }, []);

  // Filter only matches with score
  const matchesWithScore = React.useMemo(
    () => items.filter((m) => m.homeScore !== null && m.awayScore !== null),
    [items]
  );

  // Filter matches for favorite team only
  const favoriteTeamMatches = React.useMemo(() => {
    if (!favoriteTeamId) return matchesWithScore;
    return matchesWithScore.filter(
      (m) => m.homeTeamId === favoriteTeamId || m.awayTeamId === favoriteTeamId
    );
  }, [matchesWithScore, favoriteTeamId]);

  const thisYearWithScore = React.useMemo(
    () => favoriteTeamMatches.filter((m) => m.date?.startsWith(nowYear)),
    [favoriteTeamMatches, nowYear]
  );

  const stats = React.useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let totalMatches = favoriteTeamMatches.length;

    for (const m of favoriteTeamMatches) {
      if (m.homeScore === null || m.awayScore === null) continue;

      const isHome = m.homeTeamId === favoriteTeamId;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const oppGoals = isHome ? m.awayScore : m.homeScore;

      goalsFor += myGoals;
      goalsAgainst += oppGoals;

      if (myGoals > oppGoals) wins++;
      else if (myGoals < oppGoals) losses++;
      else draws++;
    }

    const avgGoals =
      totalMatches > 0 ? (goalsFor / totalMatches).toFixed(2) : "0.00";

    return {
      total: totalMatches,
      thisYear: thisYearWithScore.length,
      wins,
      draws,
      losses,
      avgGoals,
      goalsFor,
      goalsAgainst,
    };
  }, [favoriteTeamMatches, thisYearWithScore, favoriteTeamId]);

  const topTeams = React.useMemo(() => {
    const allTeamIds = favoriteTeamMatches
      .flatMap((m) => [
        m.homeTeamId === favoriteTeamId ? m.awayTeamId : m.homeTeamId,
      ])
      .filter(Boolean);
    const map = groupCount(allTeamIds);
    return topNFromMap(map, 6);
  }, [favoriteTeamMatches, favoriteTeamId]);

  const topCompetitions = React.useMemo(() => {
    const map = groupCount(
      favoriteTeamMatches.map((m) => m.competitionId).filter(Boolean)
    );
    return topNFromMap(map, 5);
  }, [favoriteTeamMatches]);

  const topStadiums = React.useMemo(() => {
    const map = groupCount(
      favoriteTeamMatches
        .map((m) =>
          typeof m.stadium === "string" ? m.stadium : m.stadium.name
        )
        .filter(Boolean)
    );
    return topNFromMap(map, 5);
  }, [favoriteTeamMatches]);

  const winRate = React.useMemo(() => {
    if (stats.total === 0) return "0.0";
    return ((stats.wins / stats.total) * 100).toFixed(1);
  }, [stats]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold">Estadísticas</div>
        <div className="mt-1 text-sm text-zinc-400">
          {favoriteTeamId
            ? `${
                teams.find((t) => t.id === favoriteTeamId)?.name ??
                favoriteTeamId
              } • Solo partidos con marcador registrado`
            : "Selecciona un equipo favorito en el dashboard para ver estadísticas"}
        </div>
      </div>

      {!favoriteTeamId ? (
        <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold text-zinc-100">
            No hay equipo favorito seleccionado
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Ve al dashboard y selecciona tu equipo favorito para ver tus
            estadísticas personalizadas.
          </div>
          <div className="mt-4">
            <Button
              asChild
              className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Link href="/">Ir al dashboard</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <StatCard
              title="Total (con marcador)"
              value={stats.total}
              subtitle="Histórico"
              icon={<Sigma className="h-5 w-5 text-zinc-200" />}
            />
            <StatCard
              title="Este año"
              value={stats.thisYear}
              subtitle={nowYear}
              icon={<CalendarDays className="h-5 w-5 text-sky-200" />}
            />
            <StatCard
              title="Goles promedio"
              value={stats.avgGoals}
              subtitle="Por partido"
              icon={<Goal className="h-5 w-5 text-emerald-200" />}
            />
            <StatCard
              title="Tasa de victoria"
              value={`${winRate}%`}
              subtitle={`${stats.wins}G ${stats.draws}E ${stats.losses}P`}
              icon={<Percent className="h-5 w-5 text-orange-200" />}
            />
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-2xl border-white/10 bg-emerald-500/10 p-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-emerald-300">
                  {stats.wins}
                </div>
                <div className="mt-1 text-xs text-emerald-200">Ganados</div>
              </div>
            </Card>
            <Card className="rounded-2xl border-white/10 bg-yellow-500/10 p-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-yellow-300">
                  {stats.draws}
                </div>
                <div className="mt-1 text-xs text-yellow-200">Empatados</div>
              </div>
            </Card>
            <Card className="rounded-2xl border-white/10 bg-red-500/10 p-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-red-300">
                  {stats.losses}
                </div>
                <div className="mt-1 text-xs text-red-200">Perdidos</div>
              </div>
            </Card>
          </div>

          {/* Goals Summary */}
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-zinc-100">Goles</div>
            <Separator className="my-3 bg-white/10" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Anotados</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-300">
                  {stats.goalsFor}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Recibidos</div>
                <div className="mt-1 text-2xl font-semibold text-red-300">
                  {stats.goalsAgainst}
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    Top estadios
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Más repetidos
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Landmark className="h-5 w-5 text-zinc-200" />
                </div>
              </div>

              <Separator className="my-3 bg-white/10" />

              {topStadiums.length === 0 ? (
                <div className="text-sm text-zinc-400">Sin datos todavía.</div>
              ) : (
                <div className="space-y-2">
                  {topStadiums.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="min-w-0 truncate text-sm text-zinc-200">
                        {name}
                      </div>
                      <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    Top equipos
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Sumando local + visita
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Users className="h-5 w-5 text-zinc-200" />
                </div>
              </div>

              <Separator className="my-3 bg-white/10" />

              {topTeams.length === 0 ? (
                <div className="text-sm text-zinc-400">Sin datos todavía.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {topTeams.map(([teamId, count]) => (
                    <div
                      key={teamId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                          {teams.find((t) => t.id === teamId)?.logoUrl ? (
                            <Image
                              src={teams.find((t) => t.id === teamId)?.logoUrl!}
                              alt={
                                teams.find((t) => t.id === teamId)?.name ??
                                teamId
                              }
                              width={22}
                              height={22}
                              className="h-5 w-5 object-contain"
                            />
                          ) : (
                            <span className="text-sm">⚽️</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-200">
                            {teams.find((t) => t.id === teamId)?.name ?? teamId}
                          </div>
                          <div className="truncate text-xs text-zinc-500">
                            {teamId}
                          </div>
                        </div>
                      </div>

                      <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    Top competiciones
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Más repetidas
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Trophy className="h-5 w-5 text-zinc-200" />
                </div>
              </div>

              <Separator className="my-3 bg-white/10" />

              {topCompetitions.length === 0 ? (
                <div className="text-sm text-zinc-400">Sin datos todavía.</div>
              ) : (
                <div className="space-y-2">
                  {topCompetitions.map(([compId, count]) => (
                    <div
                      key={compId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-zinc-200">
                          {getCompetitionLabel(compId)}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {compId}
                        </div>
                      </div>
                      <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent matches with score */}
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">
                  Últimos partidos
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  10 más recientes con marcador
                </div>
              </div>

              <Button
                asChild
                variant="secondary"
                className="rounded-xl bg-white/5 hover:bg-white/10"
              >
                <Link href="/matches">Ver todos</Link>
              </Button>
            </div>

            <Separator className="my-3 bg-white/10" />

            {favoriteTeamMatches.length === 0 ? (
              <div className="text-sm text-zinc-400">
                Aún no tienes partidos con marcador registrado.
              </div>
            ) : (
              <div className="grid gap-2">
                {favoriteTeamMatches
                  .sort(
                    (a, b) =>
                      parseISODate(b.date, b.time).getTime() -
                      parseISODate(a.date, a.time).getTime()
                  )
                  .slice(0, 10)
                  .map((m) => {
                    const home =
                      teams.find((t) => t.id === m.homeTeamId)?.name ??
                      m.homeTeamId;
                    const away =
                      teams.find((t) => t.id === m.awayTeamId)?.name ??
                      m.awayTeamId;

                    return (
                      <Link
                        key={m.id}
                        href={`/matches/${m.id}`}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 transition hover:bg-white/10"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="w-14 text-xs text-zinc-400">
                            {formatDateShort(m.date)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-zinc-200">
                              {home} <span className="text-zinc-400">vs</span>{" "}
                              {away}
                            </div>
                            <div className="truncate text-xs text-zinc-500">
                              {getCompetitionLabel(m.competitionId)} •{" "}
                              {typeof m.stadium === "string"
                                ? m.stadium
                                : m.stadium.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200 ring-1 ring-emerald-500/20">
                            {m.homeScore}-{m.awayScore}
                          </span>
                          <ArrowRight className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-300" />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
