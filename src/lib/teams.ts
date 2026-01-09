export type TeamId =
  | "america"
  | "chivas"
  | "pachuca"
  | "atletico_san_luis"
  | "atlas";

export type TeamOption = {
  id: TeamId | string;
  name: string;
  logoUrl?: string | null;
};

/**
 * Migración: si antes guardabas el nombre (ej. "Barcelona"), intenta convertirlo a id.
 * Mapeo estático para migración de datos antiguos.
 */
export function inferTeamIdFromName(name: string): string | null {
  const key = name.trim().toLowerCase();
  const nameToIdMap: Record<string, string> = {
    américa: "america",
    america: "america",
    chivas: "chivas",
    "chivas femenil": "chivas_femenil",
    pachuca: "pachuca",
    "atlético san luis": "atletico_san_luis",
    "atletico san luis": "atletico_san_luis",
    "atlético de san luis femenil": "atletico_de_san_luis_femenil",
    "atletico de san luis femenil": "atletico_de_san_luis_femenil",
    atlas: "atlas",
  };
  return nameToIdMap[key] ?? null;
}
