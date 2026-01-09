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
  Plus,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Trophy,
  Loader2,
} from "lucide-react";

type Match = {
  id: string;
  date: string;
  time: string | null;
  city: string | null;
  notes: string | null;
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  stadiumId: string;
  homeScore: number | null;
  awayScore: number | null;
  videoUrl: string | null;
  costAmount: number | null;
  costCurrency: string | null;
  createdAt: string;
  updatedAt: string;
  homeTeam: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  competition: {
    id: string;
    name: string;
    country: string | null;
  };
  stadium: {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    imageUrl: string | null;
  };
  images: Array<{ id: string; url: string }>;
};

function formatDate(dateStr: string) {
  // Extract only YYYY-MM-DD part if it's a full ISO timestamp
  const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [y, m, d] = dateOnly.split("-").map((x) => Number(x));
  if (!y || !m || !d) return dateStr;
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
  return `${d} ${months[m - 1]} ${y}`;
}

function formatDateTime(dateStr: string, time?: string | null) {
  // Extract only YYYY-MM-DD part if it's a full ISO timestamp
  const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [y, m, d] = dateOnly.split("-").map((x) => Number(x));
  if (!y || !m || !d) return dateStr;
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
  const formattedDate = `${d} ${months[m - 1]} ${y}`;
  if (time) {
    return `${formattedDate} ${time}`;
  }
  return formattedDate;
}

function MatchCard({
  match,
  onDelete,
}: {
  match: Match;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este partido?")) return;
    try {
      setDeleting(true);
      await onDelete(match.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-white/10 bg-white/5 p-4 transition hover:scale-[1.01]">
      {/* Background image */}
      {match.stadium.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${match.stadium.imageUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 space-y-4">
        {/* Competition badge */}
        <div>
          <Badge className="rounded-full bg-white/10 text-zinc-100 ring-1 ring-white/20 text-xs">
            <Trophy className="mr-1 h-3 w-3" />
            {match.competition.name}
          </Badge>
        </div>

        {/* Main Match Section */}
        <div className="space-y-4">
          {/* Teams with large logos - horizontal layout */}
          <div className="flex items-center justify-between gap-3">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-2 ring-white/20 shadow-lg">
                {match.homeTeam.logoUrl ? (
                  <Image
                    src={match.homeTeam.logoUrl}
                    alt={match.homeTeam.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl">⚽️</span>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-zinc-100 line-clamp-2">
                  {match.homeTeam.name}
                </div>
              </div>
            </div>

            {/* Score Section */}
            <div className="flex flex-col items-center gap-2">
              {hasScore ? (
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 ring-2 ring-emerald-500/30 px-4 py-3 min-w-fit">
                  <div className="text-xl font-black text-emerald-200">
                    {match.homeScore} - {match.awayScore}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-400 text-sm font-medium">vs</div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-2 ring-white/20 shadow-lg">
                {match.awayTeam.logoUrl ? (
                  <Image
                    src={match.awayTeam.logoUrl}
                    alt={match.awayTeam.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl">⚽️</span>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-zinc-100 line-clamp-2">
                  {match.awayTeam.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateTime(match.date, match.time)}
          </span>

          {match.stadium ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {match.stadium.name}
              {match.city && ` (${match.city})`}
            </span>
          ) : null}

          {match.notes ? (
            <span className="inline-flex items-center gap-1 text-zinc-400">
              {match.notes}
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Link href={`/matches/${match.id}`} className="flex-1">
            <Button
              variant="secondary"
              className="h-9 w-full rounded-lg bg-white/5 hover:bg-white/10"
              size="sm"
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Ver
            </Button>
          </Link>

          <Button
            variant="secondary"
            className="h-9 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/25"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadMatches = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load matches");
      const data = await res.json();
      setMatches(data);
    } catch (e: any) {
      setError(e?.message ?? "Error loading matches");
      console.error("Error loading matches:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete match");
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      alert(e?.message ?? "Error deleting match");
    }
  };

  // Separate upcoming and played
  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.date) >= now);
  const played = matches.filter((m) => new Date(m.date) < now);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Partidos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {matches.length} partido{matches.length !== 1 ? "s" : ""} registrado
            {matches.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/matches/new">
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error ? (
        <Card className="rounded-2xl border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </Card>
      ) : null}

      {/* Loading */}
      {loading ? (
        <Card className="rounded-2xl border-white/10 bg-white/5 p-8 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-zinc-400">Cargando partidos…</span>
        </Card>
      ) : matches.length === 0 ? (
        <Card className="rounded-2xl border-white/10 bg-white/5 p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
          <p className="text-sm text-zinc-400">
            No tienes partidos registrados. ¡Crea uno nuevo!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Próximos
                </h2>
                <Badge className="bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25">
                  {upcoming.length}
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {upcoming.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Played */}
          {played.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">Jugados</h2>
                <Badge className="bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25">
                  {played.length}
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {played.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
