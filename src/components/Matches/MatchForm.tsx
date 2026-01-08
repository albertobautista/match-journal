"use client";
"use no memo";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { nanoid } from "nanoid";
import { useFieldArray, useForm } from "react-hook-form";

import { addStoredMatch, type StoredMatch } from "@/lib/matches-storage";
import { TEAMS, getTeamById, type TeamOption } from "@/lib/teams";

import { STADIUMS_CATALOG } from "@/lib/stadiums";
import { StadiumPicker } from "./StadiumPicker";
import type { StadiumOption } from "./StadiumPicker";

import { COMPETITIONS_CATALOG } from "@/lib/competitions";
import { CompetitionPicker } from "./CompetitionPicker";
import type { CompetitionOption } from "./CompetitionPicker";

import { TeamPicker } from "./TeamPicker";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Plus, Trash2, Upload, MapPin, Calendar, Clock } from "lucide-react";

type FormValues = {
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  hasScore: boolean;
  homeScore: number | null;
  awayScore: number | null;
  costAmount: number | null;
  costCurrency: "MXN" | "USD" | "EUR";
  images: { url: string }[];
  videoUrl: string;
  notes: string;
};

const demoCities = [
  ...Array.from(
    new Set(STADIUMS_CATALOG.map((s) => s.city).filter(Boolean) as string[])
  ),
].sort((a, b) => a.localeCompare(b));

function DatalistInput({
  id,
  label,
  placeholder,
  listId,
  options,
  register,
  error,
  icon,
}: {
  id: keyof FormValues;
  label: string;
  placeholder?: string;
  listId: string;
  options: string[];
  register: unknown;
  error?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={String(id)} className="text-zinc-200">
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </Label>
      <Input
        id={String(id)}
        placeholder={placeholder}
        list={listId}
        className="rounded-xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
        {...(register as any)(id)}
      />
      <datalist id={listId}>
        {Array.from(new Set(options)).map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function MatchForm() {
  const router = useRouter();

  const defaultStadium = (STADIUMS_CATALOG[0]?.name ??
    "Estadio Azteca") as string;
  const defaultCity =
    STADIUMS_CATALOG.find((s) => s.name === defaultStadium)?.city ??
    "Ciudad de México";

  const defaultCompetitionId = (COMPETITIONS_CATALOG[0]?.id ??
    "liga_mx") as string;

  const form = useForm<FormValues>({
    defaultValues: {
      homeTeamId: "america",
      awayTeamId: "chivas",

      competitionId: defaultCompetitionId,

      date: new Date().toISOString().slice(0, 10),
      time: "19:00",

      stadium: defaultStadium,
      city: defaultCity,

      hasScore: false,
      homeScore: null,
      awayScore: null,

      costAmount: null,
      costCurrency: "MXN",

      images: [{ url: "" }],
      videoUrl: "",
      notes: "",
    },
    mode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    clearErrors,
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  const homeTeamId = watch("homeTeamId");
  const awayTeamId = watch("awayTeamId");
  const hasScore = watch("hasScore");
  const liveStadium = watch("stadium");
  const liveCompId = watch("competitionId");
  const liveHomeScore = watch("homeScore");
  const liveAwayScore = watch("awayScore");

  const selectedHome = React.useMemo<TeamOption | null>(
    () => getTeamById(homeTeamId),
    [homeTeamId]
  );
  const selectedAway = React.useMemo<TeamOption | null>(
    () => getTeamById(awayTeamId),
    [awayTeamId]
  );

  const disabledForHome = selectedAway?.id ? [selectedAway.id] : [];
  const disabledForAway = selectedHome?.id ? [selectedHome.id] : [];

  const selectedStadium = React.useMemo<StadiumOption | null>(() => {
    return (
      (STADIUMS_CATALOG.find((s) => s.name === liveStadium) as StadiumOption) ??
      null
    );
  }, [liveStadium]);

  const selectedCompetition = React.useMemo<CompetitionOption | null>(() => {
    return (
      (COMPETITIONS_CATALOG.find(
        (c) => c.id === liveCompId
      ) as CompetitionOption) ?? null
    );
  }, [liveCompId]);

  React.useEffect(() => {
    if (!hasScore) {
      setValue("homeScore", null, { shouldValidate: true });
      setValue("awayScore", null, { shouldValidate: true });
      clearErrors(["homeScore", "awayScore"]);
    }
  }, [hasScore, setValue, clearErrors]);

  const onSubmit = handleSubmit((values) => {
    // Validation
    if (!values.homeTeamId?.trim()) {
      alert("Selecciona equipo local");
      return;
    }
    if (!values.awayTeamId?.trim()) {
      alert("Selecciona equipo visitante");
      return;
    }
    if (values.homeTeamId === values.awayTeamId) {
      alert("El visitante no puede ser el mismo que el local");
      return;
    }
    if (!values.competitionId?.trim()) {
      alert("Selecciona competición");
      return;
    }
    if (!values.stadium?.trim()) {
      alert("Selecciona estadio");
      return;
    }
    if (!values.city?.trim()) {
      alert("Ingresa ciudad");
      return;
    }
    if (!values.date) {
      alert("Selecciona fecha");
      return;
    }
    if (!values.time) {
      alert("Selecciona hora");
      return;
    }
    if (
      values.hasScore &&
      (values.homeScore === null || values.awayScore === null)
    ) {
      alert("Completa goles si activas marcador");
      return;
    }

    const match: StoredMatch = {
      id: nanoid(),
      createdAt: new Date().toISOString(),

      homeTeamId: values.homeTeamId,
      awayTeamId: values.awayTeamId,
      competitionId: values.competitionId,

      date: values.date,
      time: values.time,

      stadium: values.stadium,
      city: values.city,

      homeScore: values.hasScore ? values.homeScore : null,
      awayScore: values.hasScore ? values.awayScore : null,

      costAmount: values.costAmount,
      costCurrency: values.costCurrency,

      images: (values.images as { url: string }[])
        .map((img) => img.url)
        .filter(Boolean),
      videoUrl: values.videoUrl ? values.videoUrl : null,

      notes: values.notes ? values.notes : null,
    };

    addStoredMatch(match);
    router.push("/matches");
  });

  const getErrorMessage = (error: unknown): string | undefined => {
    if (!error) return undefined;
    if (typeof error === "string") return error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    )
      return (error as Record<string, unknown>).message as string;
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">
            Añadir Nuevo Partido
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            Todo se elige desde catálogos: equipos, competición y estadio.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-white/5 hover:bg-white/10"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            Guardar Partido
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left */}
        <Card className="rounded-2xl border-white/10 bg-white/5 p-4 backdrop-blur">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25">
                {selectedCompetition?.name ?? "Competición"}
              </Badge>
              <Badge className="rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10">
                {selectedHome?.name ?? "Local"} vs{" "}
                {selectedAway?.name ?? "Visitante"}
              </Badge>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <TeamPicker
                label="Local"
                placeholder="Selecciona local"
                value={selectedHome}
                options={TEAMS}
                tone="home"
                disabledTeamIds={disabledForHome}
                error={getErrorMessage(errors.homeTeamId)}
                onChange={(t) => {
                  if (selectedAway?.id === t.id)
                    setValue("awayTeamId", "", { shouldValidate: true });
                  setValue("homeTeamId", t.id, { shouldValidate: true });
                }}
              />

              <div className="hidden md:flex items-center justify-center pb-5">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-widest text-zinc-300">
                  VS
                </div>
              </div>

              <TeamPicker
                label="Visitante"
                placeholder="Selecciona visitante"
                value={selectedAway}
                options={TEAMS}
                tone="away"
                disabledTeamIds={disabledForAway}
                error={getErrorMessage(errors.awayTeamId)}
                onChange={(t) => {
                  if (selectedHome?.id === t.id)
                    setValue("homeTeamId", "", { shouldValidate: true });
                  setValue("awayTeamId", t.id, { shouldValidate: true });
                }}
              />
            </div>

            {/* Competition + date/time */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <CompetitionPicker
                label="Competición"
                placeholder="Selecciona competición"
                options={COMPETITIONS_CATALOG as CompetitionOption[]}
                value={selectedCompetition}
                error={getErrorMessage(errors.competitionId)}
                onChange={(c) =>
                  setValue("competitionId", c.id, { shouldValidate: true })
                }
              />

              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-200">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-300" />
                    Fecha
                  </span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="rounded-xl border-white/10 bg-white/5 text-zinc-100 focus-visible:ring-emerald-500/40"
                  {...register("date")}
                />
                {errors.date ? (
                  <p className="text-xs text-red-300">
                    {getErrorMessage(errors.date)}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-zinc-200">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-300" />
                    Hora
                  </span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  className="rounded-xl border-white/10 bg-white/5 text-zinc-100 focus-visible:ring-emerald-500/40"
                  {...register("time")}
                />
                {errors.time ? (
                  <p className="text-xs text-red-300">
                    {getErrorMessage(errors.time)}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Stadium + city */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <StadiumPicker
                  label="Estadio"
                  placeholder="Selecciona estadio"
                  options={STADIUMS_CATALOG as StadiumOption[]}
                  value={selectedStadium}
                  error={getErrorMessage(errors.stadium)}
                  onChange={(s) => {
                    setValue("stadium", s.name, { shouldValidate: true });
                    if (s.city)
                      setValue("city", s.city, { shouldValidate: true });
                  }}
                />
                {errors.stadium ? (
                  <p className="text-xs text-red-300">
                    {getErrorMessage(errors.stadium)}
                  </p>
                ) : null}
              </div>

              <DatalistInput
                id="city"
                label="Ciudad"
                placeholder="Ej. Madrid"
                listId="cities"
                options={demoCities}
                register={register}
                error={getErrorMessage(errors.city)}
                icon={<MapPin className="h-4 w-4 text-zinc-300" />}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Score toggle */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-medium text-zinc-200">
                  Marcador
                </div>

                <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    className={[
                      "px-3 py-1.5 text-xs rounded-lg transition",
                      !hasScore
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-300 hover:bg-white/10",
                    ].join(" ")}
                    onClick={() =>
                      setValue("hasScore", false, { shouldValidate: true })
                    }
                  >
                    Sin marcador
                  </button>
                  <button
                    type="button"
                    className={[
                      "px-3 py-1.5 text-xs rounded-lg transition",
                      hasScore
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-300 hover:bg-white/10",
                    ].join(" ")}
                    onClick={() =>
                      setValue("hasScore", true, { shouldValidate: true })
                    }
                  >
                    Con marcador
                  </button>
                </div>
              </div>

              <div
                className={[
                  "rounded-2xl border p-3 transition",
                  hasScore
                    ? "border-emerald-500/20 bg-white/5"
                    : "border-white/10 bg-white/5 opacity-60",
                ].join(" ")}
              >
                <div className="mb-2 text-xs text-zinc-400">Final</div>

                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    placeholder="Local"
                    disabled={!hasScore}
                    className="h-11 w-full rounded-xl border-white/10 bg-black/20 text-center text-lg text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    {...register("homeScore", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-zinc-400">—</span>
                  <Input
                    inputMode="numeric"
                    placeholder="Visita"
                    disabled={!hasScore}
                    className="h-11 w-full rounded-xl border-white/10 bg-black/20 text-center text-lg text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    {...register("awayScore", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                {errors.homeScore || errors.awayScore ? (
                  <p className="mt-2 text-xs text-red-300">
                    {getErrorMessage(errors.homeScore) ||
                      getErrorMessage(errors.awayScore)}
                  </p>
                ) : null}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Cost */}
            <div className="space-y-2">
              <Label className="text-zinc-200">Costo (opcional)</Label>
              <div className="grid grid-cols-[1fr_110px] gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="Ej. 650"
                  className="rounded-xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
                  {...register("costAmount", {
                    valueAsNumber: true,
                  })}
                />
                <select
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  {...register("costCurrency")}
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Media */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-zinc-200">
                Multimedia
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Upload className="h-4 w-4 text-zinc-300" />
                      Links de imágenes
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Pega URLs. Luego lo cambiamos a uploads.
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl bg-white/5 hover:bg-white/10"
                    onClick={() => append({ url: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                <div className="mt-3 space-y-2">
                  {fields.map((f, idx) => (
                    <div key={f.id} className="grid grid-cols-[1fr_44px] gap-2">
                      <Input
                        placeholder="https://..."
                        className="rounded-xl border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
                        {...register(`images.${idx}.url`)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-xl bg-white/5 hover:bg-white/10"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                        title={
                          fields.length === 1
                            ? "Debe haber al menos 1 campo"
                            : "Eliminar"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-zinc-200">
                  Añadir video (YouTube/TikTok/etc.)
                </Label>
                <Input
                  id="videoUrl"
                  placeholder="https://..."
                  className="rounded-xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
                  {...register("videoUrl")}
                />
                {errors.videoUrl ? (
                  <p className="text-xs text-red-300">
                    {getErrorMessage(errors.videoUrl)}
                  </p>
                ) : null}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-zinc-200">
                Notas (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ej. ambiente increíble, gol al 89'..."
                className="min-h-27.5 rounded-2xl border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/40"
                {...register("notes")}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl bg-white/5 hover:bg-white/10"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Guardar Partido
              </Button>
            </div>
          </form>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="text-sm font-semibold">Preview</div>
            <p className="mt-2 text-sm text-zinc-400">
              Imagen del estadio + equipos y marcador (si aplica).
            </p>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div className="relative h-28 w-full">
                <Image
                  src={selectedStadium?.imageSrc ?? "/stadiums/default.jpg"}
                  alt={selectedStadium?.name ?? "Stadium"}
                  className="h-full w-full object-cover"
                  fill
                  sizes="100%"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-xs text-zinc-200">
                  <div className="truncate font-medium">
                    {selectedStadium?.name ?? liveStadium ?? "Estadio"}
                  </div>
                  <div className="truncate text-zinc-400">
                    {selectedStadium?.city ?? "—"}
                  </div>
                </div>
              </div>

              <div className="p-3 text-xs text-zinc-300">
                <div className="text-[11px] text-zinc-400">
                  {selectedCompetition?.name ?? "Competición"}
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {selectedHome?.name ?? "Local"}
                    </div>
                    <div className="truncate text-[11px] text-zinc-400">
                      Local
                    </div>
                  </div>

                  {hasScore ? (
                    <div className="shrink-0 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                        <span>
                          {typeof liveHomeScore === "number" &&
                          Number.isFinite(liveHomeScore)
                            ? liveHomeScore
                            : "—"}
                        </span>
                        <span className="text-emerald-200/70">-</span>
                        <span>
                          {typeof liveAwayScore === "number" &&
                          Number.isFinite(liveAwayScore)
                            ? liveAwayScore
                            : "—"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-center text-[10px] text-emerald-200/70">
                        Final
                      </div>
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-zinc-300">
                      VS
                    </div>
                  )}

                  <div className="min-w-0 text-right">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {selectedAway?.name ?? "Visitante"}
                    </div>
                    <div className="truncate text-[11px] text-zinc-400">
                      Visitante
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">
              <div className="font-medium text-zinc-200">Tip</div>
              <div className="mt-1 text-zinc-400">
                Si quieres 100% consistencia, hacemos la ciudad solo lectura
                (derivada del estadio).
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
