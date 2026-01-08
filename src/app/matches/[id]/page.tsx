// FILE: src/app/matches/[id]/page.tsx
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
} from "lucide-react";

import {
  getStoredMatchById,
  deleteStoredMatch,
  type StoredMatch,
} from "@/lib/matches-storage";
import { getTeamName, getTeamLogoUrlById } from "@/lib/teams";
import { getCompetitionLabel } from "@/lib/competitions";
import { getStadiumImageSrc } from "@/lib/stadiums";

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      // youtube.com/shorts/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx !== -1 && parts[shortsIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[shortsIdx + 1]}`;
      }

      // youtube.com/embed/<id> (ya embebido)
      const embedIdx = parts.indexOf("embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function TeamPill({ teamId, side }: { teamId: string; side: "home" | "away" }) {
  const name = getTeamName(teamId);
  const logoUrl = getTeamLogoUrlById(teamId);

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border px-3 py-2",
        side === "home"
          ? "border-emerald-500/20 bg-emerald-500/10"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-10 w-10 place-items-center overflow-hidden rounded-2xl ring-1",
          side === "home"
            ? "bg-emerald-500/10 ring-emerald-500/25"
            : "bg-white/5 ring-white/10",
        ].join(" ")}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={30}
            height={30}
            className="h-7 w-7 object-contain"
          />
        ) : (
          <span className="text-sm">⚽️</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-100">
          {name}
        </div>
        <div className="truncate text-xs text-zinc-400">ID: {teamId}</div>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [match, setMatch] = React.useState<StoredMatch | null>(null);

  React.useEffect(() => {
    if (!id) return;
    setMatch(getStoredMatchById(id));
  }, [id]);

  const stadiumBg = match?.stadium ? getStadiumImageSrc(match.stadium) : null;
  const hasScore = match?.homeScore !== null && match?.awayScore !== null;
  const hasImages = (match?.images?.length ?? 0) > 0;
  const hasVideo = !!match?.videoUrl;

  const ytEmbed = match?.videoUrl ? toYouTubeEmbed(match.videoUrl) : null;

  if (!match) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-white/5 hover:bg-white/10"
            onClick={() => router.push("/matches")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold text-zinc-100">
            No encontrado
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            No pude encontrar el match con id:{" "}
            <span className="text-zinc-200">{id}</span>
          </div>

          <div className="mt-4">
            <Button
              asChild
              className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Link href="/matches">Ir a Matches</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const homeName = getTeamName(match.homeTeamId);
  const awayName = getTeamName(match.awayTeamId);

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-white/5 hover:bg-white/10"
            onClick={() => router.push("/matches")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Matches
          </Button>

          <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
            ID: {match.id}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit placeholder: lo hacemos después */}
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-white/5 hover:bg-white/10"
            onClick={() => alert("Siguiente paso: /matches/[id]/edit")}
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
              if (!ok) return;
              deleteStoredMatch(match.id);
              router.push("/matches");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Card className="relative overflow-hidden rounded-2xl border-white/10 bg-white/5 p-0">
        {stadiumBg ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${stadiumBg})` }}
          />
        ) : null}

        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/40" />
        <div className="relative z-10 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Left */}
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25">
                  <Trophy className="mr-1 h-3.5 w-3.5" />
                  {getCompetitionLabel(match.competitionId)}
                </Badge>

                <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {match.stadium} • {match.city}
                </Badge>

                {hasImages ? (
                  <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                    <ImageIcon className="mr-1 h-3.5 w-3.5" />
                    {match.images.length}
                  </Badge>
                ) : null}

                {hasVideo ? (
                  <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                    <Video className="mr-1 h-3.5 w-3.5" />
                    Video
                  </Badge>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <div className="text-2xl font-semibold tracking-tight text-zinc-100">
                  {homeName} <span className="text-zinc-300/70">vs</span>{" "}
                  {awayName}
                </div>

                {hasScore ? (
                  <div className="inline-flex w-fit items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
                    <div className="text-lg font-semibold text-emerald-200">
                      {match.homeScore}-{match.awayScore}
                    </div>
                    <div className="ml-2 text-xs text-emerald-200/70">
                      Final
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-300/70">Sin marcador</div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-200/80">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(match.date)}
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {match.time || "--:--"}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <TeamPill teamId={match.homeTeamId} side="home" />
              <TeamPill teamId={match.awayTeamId} side="away" />
            </div>
          </div>
        </div>
      </Card>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: info */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-zinc-100">
              Información
            </div>
            <Separator className="my-3 bg-white/10" />

            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Competición</div>
                <div className="mt-1 font-medium text-zinc-100">
                  {getCompetitionLabel(match.competitionId)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Lugar</div>
                <div className="mt-1 font-medium text-zinc-100">
                  {match.stadium}
                </div>
                <div className="mt-0.5 text-xs text-zinc-400">{match.city}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Fecha</div>
                <div className="mt-1 font-medium text-zinc-100">
                  {formatDate(match.date)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-zinc-400">Hora</div>
                <div className="mt-1 font-medium text-zinc-100">
                  {match.time || "--:--"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 md:col-span-2">
                <div className="text-xs text-zinc-400">Costo</div>
                <div className="mt-1 font-medium text-zinc-100">
                  {match.costAmount !== null
                    ? `${match.costAmount} ${match.costCurrency}`
                    : "—"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-zinc-100">Notas</div>
            <Separator className="my-3 bg-white/10" />
            {match.notes ? (
              <div className="whitespace-pre-wrap text-sm text-zinc-200/90">
                {match.notes}
              </div>
            ) : (
              <div className="text-sm text-zinc-400">Sin notas.</div>
            )}
          </Card>
        </div>

        {/* Right: media */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">
                Multimedia
              </div>

              {match.videoUrl ? (
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <a href={match.videoUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir link
                  </a>
                </Button>
              ) : null}
            </div>

            <Separator className="my-3 bg-white/10" />

            {/* Video */}
            {match.videoUrl ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-400">Video</div>

                {ytEmbed ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <div className="relative aspect-video w-full">
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={ytEmbed}
                        title="Videos =(frameborder=0)" // <-- intentionally not used
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    No es YouTube (aún). Por ahora solo abrimos el link:
                    <div className="mt-1 break-all text-xs text-zinc-400">
                      {match.videoUrl}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
                Sin video.
              </div>
            )}

            {/* Images */}
            <div className="mt-4 space-y-2">
              <div className="text-xs text-zinc-400">Imágenes</div>

              {!hasImages ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
                  Sin imágenes.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {match.images.map((src, idx) => (
                    <a
                      key={`${match.id}-img-${idx}`}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                      title="Abrir imagen"
                    >
                      {/* Usamos next/image para optimizar el rendimiento de LCP */}
                      <Image
                        src={src}
                        alt={`match image ${idx + 1}`}
                        width={400}
                        height={160}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-90" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-zinc-200">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 ring-1 ring-white/10">
                          #{idx + 1}
                        </span>
                        <span className="text-zinc-300/80">
                          click para abrir
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
