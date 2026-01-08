// ===============================
// FILE: src/app/matches/page.tsx
// (Matches list actualizado a Team IDs)
// ===============================

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  getStoredMatches,
  deleteStoredMatch,
  type StoredMatch,
} from "@/lib/matches-storage";

import { getCompetitionById, CompetitionId } from "@/lib/competitions";
import { getTeamLogoUrlById, getTeamName } from "@/lib/teams";

import { getStadiumImageSrc } from "@/lib/stadiums";
import { COMPETITIONS_CATALOG, getCompetitionLabel } from "@/lib/competitions";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Plus,
  Search,
  ArrowUpDown,
  Trash2,
  Eye,
  Pencil,
  X,
  MapPin,
  Trophy,
  Clock,
  Image as ImageIcon,
  Video,
  Check,
  Sigma,
  BadgeCheck,
} from "lucide-react";

type ViewMode = "all" | "upcoming" | "played";

function parseISODate(date: string, time?: string) {
  const safeTime = time && time.trim() ? time.trim() : "00:00";
  return new Date(`${date}T${safeTime}:00`);
}

function startOfTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function diffLabel(date: string, time?: string) {
  const now = new Date();
  const startToday = startOfTodayLocal();

  const event = parseISODate(date, time);
  const eventStartDay = new Date(
    event.getFullYear(),
    event.getMonth(),
    event.getDate()
  );

  const msDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round(
    (eventStartDay.getTime() - startToday.getTime()) / msDay
  );

  if (dayDiff === 0) {
    const diffMs = event.getTime() - now.getTime();
    if (diffMs <= 0)
      return { badge: "HOY", sub: "En curso / ya pasó", isSoon: true };
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours <= 0) {
      const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
      return { badge: "HOY", sub: `En ${mins} min`, isSoon: true };
    }
    return { badge: "HOY", sub: `En ${hours} h`, isSoon: true };
  }

  if (dayDiff === 1)
    return { badge: "MAÑANA", sub: "Falta 1 día", isSoon: true };
  if (dayDiff > 1)
    return { badge: "PRÓXIMO", sub: `Faltan ${dayDiff} días`, isSoon: false };

  return { badge: "JUGADO", sub: "—", isSoon: false };
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthTitleFromKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
}

function groupByMonth<T extends { date: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const k = monthKey(it.date);
    const arr = map.get(k) ?? [];
    arr.push(it);
    map.set(k, arr);
  }
  return map;
}

function getMonthProgressPercent(monthKeyStr: string) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  if (monthKeyStr !== currentKey) return null;

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const day = now.getDate();
  const pct = Math.round((day / daysInMonth) * 100);
  return Math.max(0, Math.min(100, pct));
}

function TeamLogo({
  teamId,
  tone,
}: {
  teamId: string;
  tone?: "home" | "away";
}) {
  const url = getTeamLogoUrlById(teamId);
  const name = getTeamName(teamId);

  return (
    <div
      className={[
        "grid h-8 w-8 place-items-center rounded-xl ring-1 overflow-hidden",
        tone === "home"
          ? "bg-emerald-500/10 ring-emerald-500/25"
          : "bg-white/5 ring-white/10",
      ].join(" ")}
      title={name}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          width={22}
          height={22}
          className="h-5 w-5 object-contain"
        />
      ) : (
        <span className="text-sm">⚽️</span>
      )}
    </div>
  );
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 transition",
        active
          ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25"
          : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
      {active ? <Check className="h-3.5 w-3.5 opacity-80" /> : null}
    </button>
  );
}

function MatchItem({
  m,
  onDelete,
}: {
  m: StoredMatch;
  onDelete: (id: string) => void;
}) {
  const hasScore = m.homeScore !== null && m.awayScore !== null;
  const hasImages = (m.images?.length ?? 0) > 0;
  const hasVideo = !!m.videoUrl;

  const bg = getStadiumImageSrc(m.stadium);
  const isUpcoming =
    parseISODate(m.date, m.time).getTime() >= startOfTodayLocal().getTime();
  const when = React.useMemo(() => diffLabel(m.date, m.time), [m.date, m.time]);

  const homeName = getTeamName(m.homeTeamId);
  const awayName = getTeamName(m.awayTeamId);

  return (
    <Card
      className={[
        "group relative overflow-hidden rounded-2xl bg-white/5 p-0 transition hover:scale-[1.01]",
        isUpcoming && when.isSoon
          ? "border-amber-500/25 ring-1 ring-amber-500/15"
          : "border-white/10",
      ].join(" ")}
    >
      {bg ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-90"
          style={{ backgroundImage: `url(${bg})` }}
        />
      ) : null}

      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/65 to-black/40" />
      <div className="absolute inset-0 bg-black/10 transition duration-300 group-hover:bg-black/0" />

      <div className="relative z-10 p-4 backdrop-blur-[2px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <TeamLogo teamId={m.homeTeamId} tone="home" />
                <div className="truncate text-base font-semibold text-zinc-100">
                  {homeName}
                </div>

                {hasScore ? (
                  <span className="mx-1 inline-flex items-center rounded-lg bg-emerald-500/15 px-2 py-0.5 text-sm text-emerald-200 ring-1 ring-emerald-500/25">
                    {m.homeScore}-{m.awayScore}
                  </span>
                ) : (
                  <span className="mx-2 text-zinc-300/70">vs</span>
                )}

                <div className="truncate text-base font-semibold text-zinc-100">
                  {awayName}
                </div>
                <TeamLogo teamId={m.awayTeamId} tone="away" />
              </div>

              <Badge
                className={[
                  "rounded-full ring-1",
                  isUpcoming
                    ? when.isSoon
                      ? "bg-amber-500/15 text-amber-200 ring-amber-500/25"
                      : "bg-sky-500/15 text-sky-200 ring-sky-500/25"
                    : "bg-white/5 text-zinc-200 ring-white/10",
                ].join(" ")}
              >
                {isUpcoming ? when.badge : "JUGADO"}
              </Badge>

              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                <Trophy className="mr-1 h-3.5 w-3.5" />
                {getCompetitionLabel(m.competitionId)}
              </Badge>

              {hasImages ? (
                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  <ImageIcon className="mr-1 h-3.5 w-3.5" />
                  {m.images.length}
                </Badge>
              ) : null}
              {hasVideo ? (
                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  <Video className="mr-1 h-3.5 w-3.5" />
                  Video
                </Badge>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-200/80">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(m.date)}
              </div>

              <div className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {m.time || "--:--"}
              </div>

              {isUpcoming ? (
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-2 py-0.5 ring-1",
                    when.isSoon
                      ? "bg-amber-500/15 text-amber-200 ring-amber-500/25"
                      : "bg-white/5 text-zinc-200/80 ring-white/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      when.isSoon ? "bg-amber-300" : "bg-white/40",
                    ].join(" ")}
                  />
                  <span className="text-xs font-medium">{when.sub}</span>
                </div>
              ) : null}

              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {m.stadium} • {m.city}
                </span>
              </div>
            </div>

            {m.notes ? (
              <div className="mt-3 line-clamp-2 text-sm text-zinc-100/85">
                {m.notes}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="secondary"
              className="rounded-xl bg-white/5 hover:bg-white/10"
            >
              <Link href={`/matches/${m.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </Link>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="rounded-xl bg-white/5 hover:bg-white/10"
              onClick={() => alert("Editar: siguiente paso")}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="rounded-xl bg-white/5 hover:bg-white/10"
              onClick={() => {
                const ok = window.confirm(
                  "¿Eliminar este match? (No se puede deshacer)"
                );
                if (ok) onDelete(m.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MatchesPage() {
  const [items, setItems] = React.useState<StoredMatch[]>([]);

  const [query, setQuery] = React.useState("");
  const [year, setYear] = React.useState<string>("all");
  const [competition, setCompetition] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"date_desc" | "date_asc">("date_desc");

  const [view, setView] = React.useState<ViewMode>("all");
  const [onlyWithScore, setOnlyWithScore] = React.useState(false);

  React.useEffect(() => {
    setItems(getStoredMatches());
  }, []);

  const years = React.useMemo(() => {
    const ys = uniq(
      items.map((m) => (m?.date ? m.date.slice(0, 4) : "")).filter(Boolean)
    );
    ys.sort((a, b) => Number(b) - Number(a));
    return ys;
  }, [items]);

  const competitionOptions = React.useMemo(() => COMPETITIONS_CATALOG, []);

  const stats = React.useMemo(() => {
    const nowYear = String(new Date().getFullYear());
    const total = items.length;
    const thisYear = items.filter(
      (m) =>
        m.date?.startsWith(nowYear) &&
        m.homeScore !== null &&
        m.awayScore !== null
    ).length;
    const withScore = items.filter(
      (m) => m.homeScore !== null && m.awayScore !== null
    ).length;
    const upcomingCount = items.filter(
      (m) =>
        parseISODate(m.date, m.time).getTime() >= startOfTodayLocal().getTime()
    ).length;

    return { total, thisYear, withScore, upcoming: upcomingCount };
  }, [items]);

  const { upcoming, played } = React.useMemo(() => {
    const today = startOfTodayLocal().getTime();

    const q = query.trim().toLowerCase();
    let base = items.slice();

    if (year !== "all") base = base.filter((m) => m.date?.startsWith(year));
    if (competition !== "all")
      base = base.filter((m) => m.competitionId === competition);

    if (onlyWithScore) {
      base = base.filter((m) => m.homeScore !== null && m.awayScore !== null);
    }

    if (q) {
      base = base.filter((m) => {
        const hay = [
          getTeamName(m.homeTeamId),
          getTeamName(m.awayTeamId),
          getCompetitionLabel(m.competitionId),
          m.stadium,
          m.city,
          m.date,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

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

    pl.sort((a, b) => {
      const da = parseISODate(a.date, a.time).getTime();
      const db = parseISODate(b.date, b.time).getTime();
      return sort === "date_desc" ? db - da : da - db;
    });

    return { upcoming: up, played: pl };
  }, [items, query, year, competition, sort, onlyWithScore]);

  function resetFilters() {
    setQuery("");
    setYear("all");
    setCompetition("all");
    setSort("date_desc");
    setView("all");
    setOnlyWithScore(false);
  }

  function handleDelete(id: string) {
    deleteStoredMatch(id);
    setItems(getStoredMatches());
  }

  const showUpcoming = view === "all" || view === "upcoming";
  const showPlayed = view === "all" || view === "played";

  const nextMatch = upcoming[0] ?? null;
  const restUpcoming = nextMatch ? upcoming.slice(1) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Matches</div>
          <div className="mt-1 text-sm text-zinc-400">
            Catálogos: estadio + competición + equipos.
          </div>
        </div>

        <Button
          asChild
          className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
        >
          <Link href="/matches/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Match
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setView("all");
            setOnlyWithScore(false);
            setYear("all");
            setCompetition("all");
            setQuery("");
          }}
          className="text-left"
        >
          <Card className="group rounded-2xl border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-400">Total matches</div>
                <div className="mt-1 text-3xl font-semibold text-zinc-100">
                  {stats.total}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Todos los partidos registrados
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Sigma className="h-5 w-5 text-zinc-200" />
              </div>
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => {
            setYear(String(new Date().getFullYear()));
            setView("all");
          }}
          className="text-left"
        >
          <Card className="group rounded-2xl border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-400">Este año</div>
                <div className="mt-1 text-3xl font-semibold text-zinc-100">
                  {stats.thisYear}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {new Date().getFullYear()}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/20">
                <CalendarDays className="h-5 w-5 text-sky-200" />
              </div>
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setOnlyWithScore((v) => !v)}
          className="text-left"
        >
          <Card
            className={[
              "group rounded-2xl border-white/10 p-4 transition hover:bg-white/10",
              onlyWithScore ? "bg-emerald-500/10" : "bg-white/5",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-400">Con marcador</div>
                <div className="mt-1 text-3xl font-semibold text-zinc-100">
                  {stats.withScore}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Resultado final registrado
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <BadgeCheck className="h-5 w-5 text-emerald-200" />
              </div>
            </div>

            <div className="mt-3 text-xs text-zinc-400">
              {onlyWithScore ? "Filtro activo" : "Click para filtrar"}
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setView("upcoming")}
          className="text-left"
        >
          <Card className="relative overflow-hidden rounded-2xl border-emerald-500/25 bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-transparent to-transparent" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-200">
                  Próximos partidos
                </div>
                <div className="mt-1 text-4xl font-semibold text-white">
                  {stats.upcoming}
                </div>
                <div className="mt-1 text-xs text-emerald-100/80">
                  Planificados
                </div>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <CalendarDays className="h-6 w-6 text-emerald-200" />
              </div>
            </div>
          </Card>
        </button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_0.8fr_0.9fr_0.7fr_auto] md:items-end">
          <div className="space-y-2">
            <div className="text-sm text-zinc-200">Buscar</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Equipo, estadio, ciudad..."
                className="h-11 rounded-xl border-white/10 bg-black/20 pl-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
              />
              {query ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                  onClick={() => setQuery("")}
                  aria-label="clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-200">Año</div>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="all">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-200">Competición</div>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
            >
              <option value="all">Todas</option>
              {competitionOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-200">Orden (Jugados)</div>
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full rounded-xl bg-white/5 hover:bg-white/10"
              onClick={() =>
                setSort((s) => (s === "date_desc" ? "date_asc" : "date_desc"))
              }
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sort === "date_desc" ? "Más nuevos" : "Más viejos"}
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-xl bg-white/5 hover:bg-white/10"
            onClick={resetFilters}
          >
            Limpiar
          </Button>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip
              active={view === "all"}
              label="Todos"
              onClick={() => setView("all")}
            />
            <ToggleChip
              active={view === "upcoming"}
              label="Solo Próximos"
              onClick={() => setView("upcoming")}
            />
            <ToggleChip
              active={view === "played"}
              label="Solo Jugados"
              onClick={() => setView("played")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip
              active={onlyWithScore}
              label="Con marcador"
              onClick={() => setOnlyWithScore((v) => !v)}
            />
          </div>
        </div>

        <div className="mt-3 text-sm text-zinc-400">
          Próximos: <span className="text-zinc-200">{upcoming.length}</span> •
          Jugados: <span className="text-zinc-200">{played.length}</span>
        </div>
      </Card>

      {/* Upcoming */}
      {showUpcoming ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Próximos</div>
            <div className="text-sm text-zinc-400">
              Next match + agrupado por mes
            </div>
          </div>

          {upcoming.length === 0 ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
              No tienes próximos partidos con los filtros actuales.
            </Card>
          ) : (
            <div className="space-y-4">
              {nextMatch ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-200">
                      Next Match
                    </div>
                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25">
                      Más cercano
                    </Badge>
                  </div>

                  <div className="relative">
                    <MatchItem m={nextMatch} onDelete={handleDelete} />
                    <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-emerald-500/10 blur-2xl" />
                  </div>
                </div>
              ) : null}

              {restUpcoming.length === 0 ? null : (
                <div className="space-y-4">
                  {(() => {
                    const map = groupByMonth(restUpcoming);
                    const keys = Array.from(map.keys()).sort();

                    return keys.map((k) => {
                      const list = map.get(k)!;
                      list.sort(
                        (a, b) =>
                          parseISODate(a.date, a.time).getTime() -
                          parseISODate(b.date, b.time).getTime()
                      );

                      const pct = getMonthProgressPercent(k);

                      return (
                        <div key={k} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold capitalize text-zinc-200">
                                {monthTitleFromKey(k)}
                              </div>
                              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                                {list.length}
                              </Badge>
                            </div>

                            {pct !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="hidden text-xs text-zinc-400 md:block">
                                  Mes
                                </div>
                                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                                  <div
                                    className="h-full bg-emerald-500/60"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="text-xs text-zinc-400">
                                  {pct}%
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div className="grid gap-3">
                            {list.map((m) => (
                              <MatchItem
                                key={m.id}
                                m={m}
                                onDelete={handleDelete}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Played */}
      {showPlayed ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Jugados</div>
            <div className="text-sm text-zinc-400">
              {sort === "date_desc"
                ? "Más nuevos primero"
                : "Más viejos primero"}
            </div>
          </div>

          {played.length === 0 ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
              No tienes partidos jugados con los filtros actuales.
            </Card>
          ) : (
            <div className="grid gap-3">
              {played.map((m) => (
                <MatchItem key={m.id} m={m} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
