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
  MapPin,
  Clock,
  ArrowRight,
  Sigma,
  BadgeCheck,
  Image as ImageIcon,
  Video,
  Landmark,
  Users,
  Wallet,
  Star,
  Goal,
} from "lucide-react";

import { getStoredMatches, type StoredMatch } from "@/lib/matches-storage";
import { getCompetitionLabel } from "@/lib/competitions";
import { getTeamName, getTeamLogoUrlById } from "@/lib/teams";
import { getStadiumImageSrc } from "@/lib/stadiums";
import { getAppSettings, setFavoriteTeamId } from "@/lib/app-settings";

type MoneyCurrency = "MXN" | "USD" | "EUR";

function startOfTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseISODate(date: string, time?: string) {
  const safeTime = time && time.trim() ? time.trim() : "00:00";
  return new Date(`${date}T${safeTime}:00`);
}

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-MX", { month: "short", day: "2-digit" });
}

function formatDateLong(date: string) {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function diffText(date: string, time?: string) {
  const now = new Date();
  const event = parseISODate(date, time);
  const ms = event.getTime() - now.getTime();
  if (ms <= 0) return "Ya pasó / hoy";

  const mins = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));

  if (days >= 2) return `En ${days} días`;
  if (days === 1) return "Mañana";
  if (hours >= 1) return `En ${hours} h`;
  return `En ${Math.max(1, mins)} min`;
}

function groupCount<T extends string>(arr: T[]) {
  const map = new Map<T, number>();
  for (const k of arr) map.set(k, (map.get(k) ?? 0) + 1);
  return map;
}

function topNFromMap<K>(map: Map<K, number>, n: number) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString("es-MX", { month: "short" });
}

function TeamAvatar({ teamId }: { teamId: string }) {
  const url = getTeamLogoUrlById(teamId);
  const name = getTeamName(teamId);

  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
      {url ? (
        <Image
          src={url}
          alt={name}
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
      ) : (
        <span className="text-sm">⚽️</span>
      )}
    </div>
  );
}

function NextMatchCard({ m }: { m: StoredMatch }) {
  const homeName = getTeamName(m.homeTeamId);
  const awayName = getTeamName(m.awayTeamId);
  const bg = getStadiumImageSrc(m.stadium);

  return (
    <Card className="relative overflow-hidden rounded-2xl border-emerald-500/20 bg-white/5 p-0 ring-1 ring-emerald-500/15">
      {bg ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${bg})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/35" />

      <div className="relative z-10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25">
                Próximo partido
              </Badge>

              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                <Trophy className="mr-1 h-3.5 w-3.5" />
                {getCompetitionLabel(m.competitionId)}
              </Badge>

              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {m.stadium}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <TeamAvatar teamId={m.homeTeamId} />
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-zinc-100">
                  {homeName} <span className="text-zinc-300/70">vs</span>{" "}
                  {awayName}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-200/80">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDateLong(m.date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {m.time || "--:--"}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200 ring-1 ring-emerald-500/20">
                    {diffText(m.date, m.time)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Button
                asChild
                className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
              >
                <Link href={`/matches/${m.id}`}>
                  Ver detalle <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right text-xs text-zinc-300/70">
              {m.city ? `${m.city}` : ""}
            </div>
            <div className="flex items-center gap-2">
              {(m.images?.length ?? 0) > 0 ? (
                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  <ImageIcon className="mr-1 h-3.5 w-3.5" />
                  {m.images.length}
                </Badge>
              ) : null}
              {m.videoUrl ? (
                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  <Video className="mr-1 h-3.5 w-3.5" />
                  Video
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  onClickHref,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onClickHref?: string;
}) {
  const body = (
    <Card className="group rounded-2xl border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400">{title}</div>
          <div className="mt-1 text-3xl font-semibold text-zinc-100">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-zinc-400">{subtitle}</div>
          ) : null}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </div>
      </div>
    </Card>
  );

  if (!onClickHref) return body;

  return (
    <Link href={onClickHref} className="block">
      {body}
    </Link>
  );
}

function MiniBarsByMonth({
  matchesThisYear,
}: {
  matchesThisYear: StoredMatch[];
}) {
  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const it of matchesThisYear) {
      const k = monthKey(it.date);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [matchesThisYear]);

  const now = new Date();
  const year = now.getFullYear();

  const keys: string[] = [];
  for (let i = 0; i < 12; i++)
    keys.push(`${year}-${String(i + 1).padStart(2, "0")}`);

  const counts = keys.map((k) => map.get(k) ?? 0);
  const max = Math.max(1, ...counts);

  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-100">
            Partidos por mes
          </div>
          <div className="mt-1 text-xs text-zinc-400">{year}</div>
        </div>
        <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
          {matchesThisYear.length} total
        </Badge>
      </div>

      <Separator className="my-3 bg-white/10" />

      <div className="flex items-end gap-2">
        {keys.map((k, idx) => {
          const c = counts[idx];
          const h = Math.round((c / max) * 100);

          return (
            <div key={k} className="flex flex-1 flex-col items-center gap-2">
              <div className="h-4 text-[11px] font-medium text-zinc-200">
                {c > 0 ? c : ""}
              </div>

              <div className="h-24 w-full overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full bg-emerald-500/60"
                    style={{ height: `${Math.max(6, h)}%` }}
                    title={`${monthLabel(k)}: ${c}`}
                  />
                </div>
              </div>

              <div className="text-[10px] text-zinc-500">{monthLabel(k)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ----------------------
// ✅ “Mi equipo” helpers
// ----------------------
type ResultSymbol = "W" | "D" | "L";

function getResultForTeam(teamId: string, m: StoredMatch): ResultSymbol | null {
  if (m.homeScore === null || m.awayScore === null) return null;

  const isHome = m.homeTeamId === teamId;
  const isAway = m.awayTeamId === teamId;
  if (!isHome && !isAway) return null;

  const my = isHome ? m.homeScore : m.awayScore;
  const opp = isHome ? m.awayScore : m.homeScore;

  if (my > opp) return "W";
  if (my < opp) return "L";
  return "D";
}

function computeTeamStats(matches: StoredMatch[], teamId: string) {
  let played = 0;
  let w = 0;
  let d = 0;
  let l = 0;
  let gf = 0;
  let ga = 0;

  for (const m of matches) {
    const isHome = m.homeTeamId === teamId;
    const isAway = m.awayTeamId === teamId;
    if (!isHome && !isAway) continue;

    if (m.homeScore === null || m.awayScore === null) continue;

    played += 1;

    const teamGoals = isHome ? m.homeScore : m.awayScore;
    const oppGoals = isHome ? m.awayScore : m.homeScore;

    gf += teamGoals;
    ga += oppGoals;

    if (teamGoals > oppGoals) w += 1;
    else if (teamGoals < oppGoals) l += 1;
    else d += 1;
  }

  return { played, w, d, l, gf, ga };
}

function pickNextMatchForTeam(upcoming: StoredMatch[], teamId: string) {
  return (
    upcoming.find((m) => m.homeTeamId === teamId || m.awayTeamId === teamId) ??
    null
  );
}

function Chip({ label }: { label: ResultSymbol }) {
  const cls =
    label === "W"
      ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25"
      : label === "D"
      ? "bg-amber-500/15 text-amber-200 ring-amber-500/25"
      : "bg-rose-500/15 text-rose-200 ring-rose-500/25";

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}

function FavoriteTeamCard({
  items,
  upcoming,
}: {
  items: StoredMatch[];
  upcoming: StoredMatch[];
}) {
  const [favoriteTeamId, setFav] = React.useState<string | null>(null);

  React.useEffect(() => {
    const s = getAppSettings();
    setFav(s.favoriteTeamId);
  }, []);

  const teamOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of items) {
      if (m.homeTeamId) set.add(m.homeTeamId);
      if (m.awayTeamId) set.add(m.awayTeamId);
    }
    return Array.from(set).sort((a, b) =>
      getTeamName(a).localeCompare(getTeamName(b))
    );
  }, [items]);

  const nowYear = String(new Date().getFullYear());
  const matchesThisYear = React.useMemo(
    () => items.filter((m) => m.date?.startsWith(nowYear)),
    [items, nowYear]
  );

  const teamMatchesThisYear = React.useMemo(() => {
    if (!favoriteTeamId) return [];
    return matchesThisYear.filter(
      (m) => m.homeTeamId === favoriteTeamId || m.awayTeamId === favoriteTeamId
    );
  }, [matchesThisYear, favoriteTeamId]);

  // ✅ 1) Racha (últimos 5 con marcador)
  const streak = React.useMemo(() => {
    if (!favoriteTeamId) return [];
    const playedWithScore = teamMatchesThisYear
      .filter((m) => m.homeScore !== null && m.awayScore !== null)
      .slice()
      .sort(
        (a, b) =>
          parseISODate(b.date, b.time).getTime() -
          parseISODate(a.date, a.time).getTime()
      );

    const last5 = playedWithScore.slice(0, 5);
    return last5
      .map((m) => getResultForTeam(favoriteTeamId, m))
      .filter((x): x is ResultSymbol => !!x);
  }, [favoriteTeamId, teamMatchesThisYear]);

  // Stats global del año (con marcador)
  const stats = React.useMemo(() => {
    if (!favoriteTeamId) return null;
    return computeTeamStats(matchesThisYear, favoriteTeamId);
  }, [matchesThisYear, favoriteTeamId]);

  // Próximo
  const nextForTeam = React.useMemo(() => {
    if (!favoriteTeamId) return null;
    return pickNextMatchForTeam(upcoming, favoriteTeamId);
  }, [upcoming, favoriteTeamId]);

  // ✅ 2) Stats por competición (con marcador)
  const byCompetition = React.useMemo(() => {
    if (!favoriteTeamId) return [];

    const map = new Map<
      string,
      {
        compId: string;
        played: number;
        w: number;
        d: number;
        l: number;
        gf: number;
        ga: number;
      }
    >();

    for (const m of teamMatchesThisYear) {
      if (m.homeScore === null || m.awayScore === null) continue;

      const compId = m.competitionId;
      const isHome = m.homeTeamId === favoriteTeamId;
      const my = isHome ? m.homeScore : m.awayScore;
      const opp = isHome ? m.awayScore : m.homeScore;

      const cur = map.get(compId) ?? {
        compId,
        played: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
      };
      cur.played += 1;
      cur.gf += my;
      cur.ga += opp;
      if (my > opp) cur.w += 1;
      else if (my < opp) cur.l += 1;
      else cur.d += 1;

      map.set(compId, cur);
    }

    return Array.from(map.values()).sort((a, b) => b.played - a.played);
  }, [favoriteTeamId, teamMatchesThisYear]);

  // ✅ 3) Goles promedio + partido más goleador (del año, con marcador)
  const goalInsights = React.useMemo(() => {
    if (!favoriteTeamId) return null;

    const withScore = teamMatchesThisYear.filter(
      (m) => m.homeScore !== null && m.awayScore !== null
    );
    const played = withScore.length;

    if (played === 0) {
      return {
        played: 0,
        avgGF: 0,
        avgGA: 0,
        best: null as StoredMatch | null,
        bestTotal: 0,
      };
    }

    let sumGF = 0;
    let sumGA = 0;

    let best: StoredMatch | null = null;
    let bestTotal = -1;

    for (const m of withScore) {
      const isHome = m.homeTeamId === favoriteTeamId;
      const gf = isHome ? m.homeScore ?? 0 : m.awayScore ?? 0;
      const ga = isHome ? m.awayScore ?? 0 : m.homeScore ?? 0;

      sumGF += gf;
      sumGA += ga;

      const total = (m.homeScore ?? 0) + (m.awayScore ?? 0);
      if (total > bestTotal) {
        bestTotal = total;
        best = m;
      }
    }

    return {
      played,
      avgGF: sumGF / played,
      avgGA: sumGA / played,
      best,
      bestTotal,
    };
  }, [favoriteTeamId, teamMatchesThisYear]);

  const logo = favoriteTeamId ? getTeamLogoUrlById(favoriteTeamId) : null;
  const name = favoriteTeamId ? getTeamName(favoriteTeamId) : "—";

  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25">
              <Star className="mr-1 h-3.5 w-3.5" />
              Mi equipo
            </Badge>
            <span className="text-xs text-zinc-400">
              ({new Date().getFullYear()})
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              {logo ? (
                <Image
                  src={logo}
                  alt={name}
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-lg">⚽️</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-zinc-100">
                {name}
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                Stats basadas en tus matches guardados.
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72">
          <label className="block text-xs text-zinc-400">Equipo favorito</label>
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/30"
            value={favoriteTeamId ?? ""}
            onChange={(e) => {
              const next = e.target.value || null;
              setFav(next);
              setFavoriteTeamId(next);
            }}
            disabled={teamOptions.length === 0}
          >
            {teamOptions.length === 0 ? (
              <option value="">Agrega matches primero</option>
            ) : (
              <>
                <option value="">— Selecciona —</option>
                {teamOptions.map((id) => (
                  <option key={id} value={id}>
                    {getTeamName(id)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {!favoriteTeamId ? null : (
        <>
          <Separator className="my-4 bg-white/10" />

          {/* KPIs + Racha */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">Partidos (este año)</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {teamMatchesThisYear.length}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Con marcador:{" "}
                <span className="text-zinc-300">{stats?.played ?? 0}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">
                G / E / P (con marcador)
              </div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {stats ? `${stats.w} / ${stats.d} / ${stats.l}` : "—"}
              </div>

              {/* ✅ 1) racha */}
              <div className="mt-3">
                <div className="text-xs text-zinc-500">
                  Últimos 5 (con marcador)
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {streak.length === 0 ? (
                    <span className="text-sm text-zinc-400">—</span>
                  ) : (
                    streak.map((s, i) => <Chip key={`${s}-${i}`} label={s} />)
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">
                GF / GC (con marcador)
              </div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {stats ? `${stats.gf} / ${stats.ga}` : "—"}
              </div>

              {/* ✅ 3) promedios */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">
                    Promedio por partido
                  </div>
                  <div className="mt-1 text-sm text-zinc-200">
                    GF{" "}
                    <span className="font-semibold">
                      {goalInsights ? goalInsights.avgGF.toFixed(2) : "0.00"}
                    </span>{" "}
                    • GC{" "}
                    <span className="font-semibold">
                      {goalInsights ? goalInsights.avgGA.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Goal className="h-5 w-5 text-zinc-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Próximo + Partido más goleador */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-100">
                  Próximo partido
                </div>
                <span className="text-xs text-zinc-500">
                  {diffText(nextForTeam?.date ?? "", nextForTeam?.time)}
                </span>
              </div>

              <Separator className="my-3 bg-white/10" />

              {nextForTeam ? (
                <Link
                  href={`/matches/${nextForTeam.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <div className="truncate text-sm font-semibold text-zinc-100">
                    {getTeamName(nextForTeam.homeTeamId)}{" "}
                    <span className="text-zinc-400">vs</span>{" "}
                    {getTeamName(nextForTeam.awayTeamId)}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateLong(nextForTeam.date)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {nextForTeam.time || "--:--"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {nextForTeam.stadium}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-zinc-400">
                  No hay próximos para este equipo.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-100">
                  Partido más goleador
                </div>
                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  Total goles: {goalInsights?.bestTotal ?? 0}
                </Badge>
              </div>

              <Separator className="my-3 bg-white/10" />

              {goalInsights?.best ? (
                <Link
                  href={`/matches/${goalInsights.best.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-100">
                        {getTeamName(goalInsights.best.homeTeamId)}{" "}
                        <span className="text-zinc-400">vs</span>{" "}
                        {getTeamName(goalInsights.best.awayTeamId)}
                      </div>
                      <div className="mt-1 truncate text-xs text-zinc-400">
                        {formatDateLong(goalInsights.best.date)} •{" "}
                        {getCompetitionLabel(goalInsights.best.competitionId)}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/20">
                      {goalInsights.best.homeScore}-
                      {goalInsights.best.awayScore}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-zinc-400">
                  Aún no hay partidos con marcador.
                </div>
              )}
            </div>
          </div>

          {/* ✅ 2) Stats por competición */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">
                Por competición
              </div>
              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                Con marcador: {stats?.played ?? 0}
              </Badge>
            </div>

            <Separator className="my-3 bg-white/10" />

            {byCompetition.length === 0 ? (
              <div className="text-sm text-zinc-400">
                Aún no hay datos con marcador.
              </div>
            ) : (
              <div className="grid gap-2">
                {byCompetition.map((row) => (
                  <div
                    key={row.compId}
                    className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-200">
                        {getCompetitionLabel(row.compId)}
                      </div>
                      <div className="truncate text-xs text-zinc-500">
                        {row.compId}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200">
                      <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                        PJ {row.played}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                        G/E/P {row.w}/{row.d}/{row.l}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                        GF/GC {row.gf}/{row.ga}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const [items, setItems] = React.useState<StoredMatch[]>([]);

  React.useEffect(() => {
    setItems(getStoredMatches());
  }, []);

  const today = startOfTodayLocal().getTime();
  const nowYear = String(new Date().getFullYear());

  const { upcoming, played } = React.useMemo(() => {
    const base = items.slice();

    const up = base.filter(
      (m) => parseISODate(m.date, m.time).getTime() >= today
    );
    const pl = base.filter(
      (m) => parseISODate(m.date, m.time).getTime() < today
    );

    up.sort(
      (a, b) =>
        parseISODate(a.date, a.time).getTime() -
        parseISODate(b.date, b.time).getTime()
    );
    pl.sort(
      (a, b) =>
        parseISODate(b.date, b.time).getTime() -
        parseISODate(a.date, a.time).getTime()
    );

    return { upcoming: up, played: pl };
  }, [items, today]);

  const thisYearMatches = React.useMemo(
    () => items.filter((m) => m.date?.startsWith(nowYear)),
    [items, nowYear]
  );

  const withScoreCount = React.useMemo(
    () =>
      items.filter((m) => m.homeScore !== null && m.awayScore !== null).length,
    [items]
  );

  const mediaCount = React.useMemo(() => {
    const img = items.reduce((acc, m) => acc + (m.images?.length ?? 0), 0);
    const vid = items.filter((m) => !!m.videoUrl).length;
    return { images: img, videos: vid };
  }, [items]);

  const nextMatch = upcoming[0] ?? null;

  const matchesWithScore = React.useMemo(
    () => items.filter((m) => m.homeScore !== null && m.awayScore !== null),
    [items]
  );

  const topStadiums = React.useMemo(() => {
    const map = groupCount(
      matchesWithScore.map((m) => m.stadium).filter(Boolean)
    );
    return topNFromMap(map, 5);
  }, [matchesWithScore]);

  const topTeams = React.useMemo(() => {
    const allTeamIds = matchesWithScore
      .flatMap((m) => [m.homeTeamId, m.awayTeamId])
      .filter(Boolean);
    const map = groupCount(allTeamIds);
    return topNFromMap(map, 6);
  }, [matchesWithScore]);

  const topCompetitions = React.useMemo(() => {
    const map = groupCount(
      matchesWithScore.map((m) => m.competitionId).filter(Boolean)
    );
    return topNFromMap(map, 5);
  }, [matchesWithScore]);

  const spendByCurrency = React.useMemo(() => {
    const sums = new Map<MoneyCurrency, number>();
    for (const m of items) {
      if (m.costAmount === null) continue;
      const cur = (m.costCurrency ?? "MXN") as MoneyCurrency;
      sums.set(cur, (sums.get(cur) ?? 0) + m.costAmount);
    }
    return Array.from(sums.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="mt-1 text-sm text-zinc-400">
            Resumen rápido de tu año futbolero.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="secondary"
            className="rounded-xl bg-white/5 hover:bg-white/10"
          >
            <Link href="/matches">Ir a Matches</Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
          >
            <Link href="/matches/new">Add Match</Link>
          </Button>
        </div>
      </div>

      {/* ✅ Mi equipo (con: racha + por competición + promedios + best match) */}
      <FavoriteTeamCard items={items} upcoming={upcoming} />

      {/* Next match (general) */}
      {nextMatch ? (
        <NextMatchCard m={nextMatch} />
      ) : (
        <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold text-zinc-100">
            No tienes próximos partidos
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Agrega uno para verlo destacado aquí.
          </div>
          <div className="mt-4">
            <Button
              asChild
              className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Link href="/matches/new">Añadir</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatCard
          title="Total matches"
          value={items.length}
          subtitle="Histórico"
          icon={<Sigma className="h-5 w-5 text-zinc-200" />}
          onClickHref="/matches"
        />
        <StatCard
          title="Este año"
          value={thisYearMatches.length}
          subtitle={nowYear}
          icon={<CalendarDays className="h-5 w-5 text-sky-200" />}
          onClickHref="/matches"
        />
        <StatCard
          title="Con marcador"
          value={withScoreCount}
          subtitle="Resultados finales"
          icon={<BadgeCheck className="h-5 w-5 text-emerald-200" />}
          onClickHref="/matches"
        />
        <StatCard
          title="Próximos"
          value={upcoming.length}
          subtitle="Planeados"
          icon={<CalendarDays className="h-5 w-5 text-emerald-200" />}
          onClickHref="/matches"
        />
      </div>

      {/* Middle grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <MiniBarsByMonth matchesThisYear={thisYearMatches} />

        <div className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">Media</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Imágenes y videos guardados
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <ImageIcon className="h-5 w-5 text-zinc-200" />
              </div>
            </div>

            <Separator className="my-3 bg-white/10" />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Imágenes</div>
                <div className="mt-1 text-2xl font-semibold text-zinc-100">
                  {mediaCount.images}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Videos</div>
                <div className="mt-1 text-2xl font-semibold text-zinc-100">
                  {mediaCount.videos}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">
                  Gasto registrado
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Sumas por moneda (sin convertir)
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Wallet className="h-5 w-5 text-zinc-200" />
              </div>
            </div>

            <Separator className="my-3 bg-white/10" />

            {spendByCurrency.length === 0 ? (
              <div className="text-sm text-zinc-400">
                Aún no has capturado costos.
              </div>
            ) : (
              <div className="space-y-2">
                {spendByCurrency.map(([cur, amount]) => (
                  <div
                    key={cur}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                  >
                    <div className="text-sm text-zinc-200">{cur}</div>
                    <div className="text-sm font-semibold text-zinc-100">
                      {amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">
                Top estadios
              </div>
              <div className="mt-1 text-xs text-zinc-400">Más repetidos</div>
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
                      {getTeamLogoUrlById(teamId) ? (
                        <Image
                          src={getTeamLogoUrlById(teamId)!}
                          alt={getTeamName(teamId)}
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
                        {getTeamName(teamId)}
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
              <div className="mt-1 text-xs text-zinc-400">Más repetidas</div>
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

      {/* Recent played */}
      <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-100">
              Últimos jugados
            </div>
            <div className="mt-1 text-xs text-zinc-400">5 más recientes</div>
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

        {played.length === 0 ? (
          <div className="text-sm text-zinc-400">Aún no tienes jugados.</div>
        ) : (
          <div className="grid gap-2">
            {played
              .filter((m) => m.homeScore !== null && m.awayScore !== null)
              .slice(0, 5)
              .map((m) => {
                const home = getTeamName(m.homeTeamId);
                const away = getTeamName(m.awayTeamId);

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
                          {getCompetitionLabel(m.competitionId)} • {m.stadium}
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
    </div>
  );
}
