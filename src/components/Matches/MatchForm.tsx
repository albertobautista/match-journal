"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Save,
  Image as ImageIcon,
  Video,
} from "lucide-react";

type Team = { id: string; name: string; logoUrl: string | null };
type Competition = { id: string; name: string; country: string | null };
type Stadium = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
};

type CatalogResponse = {
  teams: Team[];
  competitions: Competition[];
  stadiums: Stadium[];
};

type FormState = {
  date: string; // YYYY-MM-DD
  time: string;

  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  stadiumId: string;

  city: string;
  notes: string;

  homeScore: string;
  awayScore: string;

  videoUrl: string;
  imageUrls: string; // textarea multiline

  costAmount: string;
  costCurrency: string;
};

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toNullableInt(v: string) {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toNullableFloat(v: string) {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function splitUrls(multiline: string) {
  return multiline
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function TeamOption({ t }: { t: Team }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-6 w-6 place-items-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
        {t.logoUrl ? (
          <Image
            src={t.logoUrl}
            alt={t.name}
            width={18}
            height={18}
            className="h-4 w-4 object-contain"
          />
        ) : (
          <span className="text-xs">⚽️</span>
        )}
      </div>
      <span>{t.name}</span>
    </div>
  );
}

export default function MatchForm({
  initialMatch,
}: {
  initialMatch?: any;
} = {}) {
  const router = useRouter();

  const [catalog, setCatalog] = React.useState<CatalogResponse | null>(null);
  const [loadingCatalog, setLoadingCatalog] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Función para convertir fecha al formato YYYY-MM-DD
  function dateToYYYYMMDD(date: string | Date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const initialState: FormState = initialMatch
    ? {
        date: dateToYYYYMMDD(initialMatch.date),
        time: initialMatch.time || "",
        homeTeamId: initialMatch.homeTeamId,
        awayTeamId: initialMatch.awayTeamId,
        competitionId: initialMatch.competitionId,
        stadiumId: initialMatch.stadiumId,
        city: initialMatch.city || "",
        notes: initialMatch.notes || "",
        homeScore: initialMatch.homeScore ? String(initialMatch.homeScore) : "",
        awayScore: initialMatch.awayScore ? String(initialMatch.awayScore) : "",
        videoUrl: initialMatch.videoUrl || "",
        imageUrls:
          initialMatch.images?.map((img: any) => img.url).join("\n") || "",
        costAmount: initialMatch.costAmount
          ? String(initialMatch.costAmount)
          : "",
        costCurrency: initialMatch.costCurrency || "MXN",
      }
    : {
        date: todayYYYYMMDD(),
        time: "",

        homeTeamId: "",
        awayTeamId: "",
        competitionId: "",
        stadiumId: "",

        city: "",
        notes: "",

        homeScore: "",
        awayScore: "",

        videoUrl: "",
        imageUrls: "",

        costAmount: "",
        costCurrency: "MXN",
      };

  const [form, setForm] = React.useState<FormState>(initialState);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoadingCatalog(true);

        // Cargar todos los catálogos en paralelo
        const [teamsRes, competitionsRes, stadiumsRes] = await Promise.all([
          fetch("/api/teams", { cache: "no-store" }),
          fetch("/api/competitions", { cache: "no-store" }),
          fetch("/api/stadiums", { cache: "no-store" }),
        ]);

        if (!teamsRes.ok || !competitionsRes.ok || !stadiumsRes.ok) {
          throw new Error("Failed to load catalog");
        }

        const [teams, competitions, stadiums] = await Promise.all([
          teamsRes.json(),
          competitionsRes.json(),
          stadiumsRes.json(),
        ]);

        if (!alive) return;

        const data: CatalogResponse = { teams, competitions, stadiums };
        setCatalog(data);

        // defaults
        const firstTeam = data.teams[0]?.id ?? "";
        const secondTeam = data.teams[1]?.id ?? firstTeam ?? "";
        const firstComp = data.competitions[0]?.id ?? "";
        const firstStadium = data.stadiums[0]?.id ?? "";

        setForm((prev) => ({
          ...prev,
          homeTeamId: prev.homeTeamId || firstTeam,
          awayTeamId: prev.awayTeamId || secondTeam,
          competitionId: prev.competitionId || firstComp,
          stadiumId: prev.stadiumId || firstStadium,
        }));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error loading catalog");
      } finally {
        if (alive) setLoadingCatalog(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const teams = catalog?.teams ?? [];
  const competitions = catalog?.competitions ?? [];
  const stadiums = catalog?.stadiums ?? [];

  const homeTeam = teams.find((t) => t.id === form.homeTeamId) ?? null;
  const awayTeam = teams.find((t) => t.id === form.awayTeamId) ?? null;
  const comp = competitions.find((c) => c.id === form.competitionId) ?? null;
  const stadium = stadiums.find((s) => s.id === form.stadiumId) ?? null;

  const previewImages = React.useMemo(
    () => splitUrls(form.imageUrls),
    [form.imageUrls]
  );

  const sameTeams =
    form.homeTeamId && form.awayTeamId && form.homeTeamId === form.awayTeamId;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !form.date ||
      !form.homeTeamId ||
      !form.awayTeamId ||
      !form.competitionId ||
      !form.stadiumId
    ) {
      setError("Completa los campos requeridos.");
      return;
    }
    if (sameTeams) {
      setError("Local y visita deben ser diferentes.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        date: form.date,
        time: form.time?.trim() ? form.time.trim() : null,
        city: form.city?.trim() ? form.city.trim() : null,
        notes: form.notes?.trim() ? form.notes.trim() : null,

        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        competitionId: form.competitionId,
        stadiumId: form.stadiumId,

        homeScore: toNullableInt(form.homeScore),
        awayScore: toNullableInt(form.awayScore),

        videoUrl: form.videoUrl?.trim() ? form.videoUrl.trim() : null,
        imageUrls: previewImages.length ? previewImages : [],

        costAmount: toNullableFloat(form.costAmount),
        costCurrency: form.costCurrency?.trim()
          ? form.costCurrency.trim()
          : null,
      };

      // Si estamos editando, usar PUT, si no, POST
      const method = initialMatch ? "PUT" : "POST";
      const url = initialMatch
        ? `/api/matches/${initialMatch.id}`
        : "/api/matches";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ?? "Failed to save match";
        throw new Error(msg);
      }

      const result = await res.json();

      if (!result.id) {
        throw new Error("Invalid response from server");
      }

      router.push(`/matches/${result.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Error saving match");
    } finally {
      setSaving(false);
    }
  }

  if (loadingCatalog) {
    return (
      <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
        <div className="text-sm text-zinc-300">Cargando catálogo…</div>
      </Card>
    );
  }

  if (!catalog) {
    return (
      <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
        <div className="text-sm text-zinc-300">
          No se pudo cargar el catálogo.
        </div>
        {error ? (
          <div className="mt-2 text-sm text-rose-200">{error}</div>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.9fr]">
      {/* FORM */}
      <Card className="rounded-2xl border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-zinc-100">
              {initialMatch ? "Editar partido" : "Nuevo partido"}
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {initialMatch
                ? "Actualiza los datos del match."
                : "Captura los datos del match."}
            </div>
          </div>

          <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
            <Trophy className="mr-1 h-3.5 w-3.5" />
            DB catalog
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Date / Time */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Fecha *</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-zinc-400" />
                <input
                  type="date"
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Hora</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <input
                  type="time"
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Local *</label>
              <select
                className={`mt-1 w-full rounded-xl border bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none ${
                  sameTeams ? "border-rose-500/40" : "border-white/10"
                }`}
                value={form.homeTeamId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, homeTeamId: e.target.value }))
                }
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Visita *</label>
              <select
                className={`mt-1 w-full rounded-xl border bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none ${
                  sameTeams ? "border-rose-500/40" : "border-white/10"
                }`}
                value={form.awayTeamId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, awayTeamId: e.target.value }))
                }
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {sameTeams ? (
                <div className="mt-1 text-xs text-rose-200">
                  Local y visita deben ser diferentes.
                </div>
              ) : null}
            </div>
          </div>

          {/* Competition / Stadium */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Competición *</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.competitionId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, competitionId: e.target.value }))
                }
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Estadio *</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.stadiumId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stadiumId: e.target.value }))
                }
              >
                {stadiums.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.city ? ` (${s.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City / Notes */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Ciudad</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Ej: Barcelona"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Notas</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Ej: gran ambiente, buen asiento…"
              />
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Marcador (Local)</label>
              <input
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.homeScore}
                onChange={(e) =>
                  setForm((p) => ({ ...p, homeScore: e.target.value }))
                }
                placeholder="Ej: 2"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Marcador (Visita)</label>
              <input
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.awayScore}
                onChange={(e) =>
                  setForm((p) => ({ ...p, awayScore: e.target.value }))
                }
                placeholder="Ej: 1"
              />
            </div>
          </div>

          {/* Media */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Video URL</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <Video className="h-4 w-4 text-zinc-400" />
                <input
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none"
                  value={form.videoUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, videoUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400">
                Imágenes (1 URL por línea)
              </label>
              <div className="mt-1 flex items-start gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <ImageIcon className="mt-0.5 h-4 w-4 text-zinc-400" />
                <textarea
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-zinc-200 outline-none"
                  value={form.imageUrls}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrls: e.target.value }))
                  }
                  placeholder={"https://...\nhttps://..."}
                />
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Costo</label>
              <input
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.costAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, costAmount: e.target.value }))
                }
                placeholder="Ej: 1500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Moneda</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none"
                value={form.costCurrency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, costCurrency: e.target.value }))
                }
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar match"}
            </Button>
          </div>
        </form>
      </Card>

      {/* PREVIEW */}
      <Card className="relative overflow-hidden rounded-2xl border-white/10 bg-white/5 p-0">
        {/* Stadium background */}
        {stadium?.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${stadium.imageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />

        <div className="relative z-10 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-zinc-100">Preview</div>
              <div className="mt-1 text-sm text-zinc-400">
                Así se verá tu match.
              </div>
            </div>

            {comp ? (
              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                <Trophy className="mr-1 h-3.5 w-3.5" />
                {comp.name}
              </Badge>
            ) : null}
          </div>

          <Separator className="my-4 bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              {homeTeam?.logoUrl ? (
                <Image
                  src={homeTeam.logoUrl}
                  alt={homeTeam.name}
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-lg">⚽️</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-xl font-semibold text-zinc-100">
                {homeTeam?.name ?? "—"}{" "}
                <span className="text-zinc-400">vs</span>{" "}
                {awayTeam?.name ?? "—"}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-200/80">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {form.date || "—"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {form.time || "--:--"}
                </span>
                {stadium ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {stadium.name}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="ml-auto grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              {awayTeam?.logoUrl ? (
                <Image
                  src={awayTeam.logoUrl}
                  alt={awayTeam.name}
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-lg">⚽️</span>
              )}
            </div>
          </div>

          {/* Score preview */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-sm text-zinc-300">Marcador</div>
            <div className="text-lg font-semibold text-zinc-100">
              {(form.homeScore || "—") + " - " + (form.awayScore || "—")}
            </div>
          </div>

          {/* Media preview */}
          <div className="mt-4 space-y-2">
            {form.videoUrl.trim() ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Video className="h-4 w-4" />
                  Video
                </div>
                <div className="mt-1 truncate text-zinc-200">
                  {form.videoUrl}
                </div>
              </div>
            ) : null}

            {previewImages.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <ImageIcon className="h-4 w-4" />
                  Imágenes ({previewImages.length})
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {previewImages.slice(0, 6).map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative aspect-video overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/10"
                    >
                      <Image
                        src={url}
                        alt={`Match image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Stadium image small label */}
          {stadium?.imageUrl ? (
            <div className="mt-4 text-xs text-zinc-300/70">
              Fondo: {stadium.name}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
