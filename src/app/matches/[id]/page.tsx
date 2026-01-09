"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  ArrowLeft,
  Trash2,
  Pencil,
  ExternalLink,
  Image as ImageIcon,
  Video,
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
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const id =
      u.searchParams.get("v") ||
      u.pathname.replace("/watch", "").replace("v/", "").split("?")[0];
    return id
      ? `https://www.youtube.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = React.useState<Match | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!matchId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/matches/${matchId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Match not found");
        const data = await res.json();
        setMatch(data);
      } catch (e: any) {
        setError(e?.message ?? "Error loading match");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [matchId]);

  const handleDelete = async () => {
    if (!match || !confirm("¿Eliminar este partido permanentemente?")) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/matches/${match.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete match");
      router.push("/matches");
    } catch (e: any) {
      alert(e?.message ?? "Error deleting match");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando…
      </div>
    );
  }

  if (error || !match) {
    return (
      <Card className="rounded-2xl border-rose-500/20 bg-rose-500/10 p-6 text-center">
        <div className="text-sm text-rose-200 mb-4">{error ?? "Match not found"}</div>
        <Link href="/matches">
          <Button variant="secondary" className="rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </Card>
    );
  }

  const hasScore =
    match.homeScore !== null && match.awayScore !== null;
  const youtubeId = match.videoUrl
    ? toYouTubeEmbed(match.videoUrl)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/matches">
          <Button
            variant="secondary"
            className="h-9 rounded-lg bg-white/5 hover:bg-white/10"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/matches/${match.id}/edit`}>
            <Button
              variant="secondary"
              className="h-9 rounded-lg bg-white/5 hover:bg-white/10"
              size="sm"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="h-9 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/25"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match header */}
      <Card className="relative overflow-hidden rounded-2xl border-white/10 bg-white/5 p-0">
        {match.stadium?.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${match.stadium.imageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />

        <div className="relative z-10 space-y-6 p-6">
          {/* Teams */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                {match.homeTeam.logoUrl ? (
                  <Image
                    src={match.homeTeam.logoUrl}
                    alt={match.homeTeam.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <span className="text-3xl">⚽️</span>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-100">
                  {match.homeTeam.name}
                </div>
                <div className="text-xs text-zinc-400">Local</div>
              </div>
            </div>

            {/* Score / vs */}
            <div className="flex flex-col items-center gap-2">
              {hasScore ? (
                <div className="text-4xl font-bold text-zinc-100">
                  {match.homeScore}
                  <span className="text-2xl text-zinc-400 mx-1">-</span>
                  {match.awayScore}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-zinc-400">vs</div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                {match.awayTeam.logoUrl ? (
                  <Image
                    src={match.awayTeam.logoUrl}
                    alt={match.awayTeam.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <span className="text-3xl">⚽️</span>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-100">
                  {match.awayTeam.name}
                </div>
                <div className="text-xs text-zinc-400">Visita</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Badge className="bg-white/5 text-zinc-200 ring-1 ring-white/10">
              <Trophy className="mr-1 h-3.5 w-3.5" />
              {match.competition.name}
            </Badge>

            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-200">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(match.date)}
              </span>
              {match.time ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {match.time}
                </span>
              ) : null}
              {match.stadium ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {match.stadium.name}
                  {match.city && ` (${match.city})`}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          {/* Notes */}
          {match.notes ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-zinc-200 mb-2">
                Notas
              </div>
              <p className="text-sm text-zinc-400">{match.notes}</p>
            </Card>
          ) : null}

          {/* Video */}
          {youtubeId ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={youtubeId}
                  title="Match video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-2xl"
                />
              </div>
            </Card>
          ) : null}

          {/* Images */}
          {match.images.length > 0 ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imágenes ({match.images.length})
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {match.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/10 hover:ring-emerald-500/50 transition"
                  >
                    <Image
                      src={img.url}
                      alt="Match image"
                      fill
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cost */}
          {match.costAmount ? (
            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-zinc-400 uppercase mb-2">
                Costo
              </div>
              <div className="text-2xl font-bold text-zinc-100">
                {match.costAmount}
                <span className="text-sm text-zinc-400 ml-1">
                  {match.costCurrency}
                </span>
              </div>
            </Card>
          ) : null}

          {/* Info */}
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase">
                ID Partido
              </div>
              <div className="text-xs font-mono text-zinc-300 mt-1">
                {match.id}
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase">
                Creado
              </div>
              <div className="text-xs text-zinc-300 mt-1">
                {new Date(match.createdAt).toLocaleDateString("es-MX")}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
