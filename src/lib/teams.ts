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

export const TEAMS: TeamOption[] = [
  {
    id: "america",
    name: "América",
    logoUrl: "/images/logos/america.webp",
  },
  { id: "chivas", name: "Chivas", logoUrl: "/images/logos/chivas.webp" },
  {
    id: "chivas_femenil",
    name: "Chivas Femenil",
    logoUrl: "/images/logos/chivas.webp",
  },
  {
    id: "pachuca",
    name: "Pachuca",
    logoUrl: "/images/logos/pachuca.webp",
  },
  {
    id: "atletico_san_luis",
    name: "Atlético San Luis",
    logoUrl: "/images/logos/atletico_san_luis.webp",
  },
  {
    id: "atletico_san_luis_femenil",
    name: "Atlético San Luis Femenil",
    logoUrl: "/images/logos/atletico_san_luis.webp",
  },
  {
    id: "atlas",
    name: "Atlas",
    logoUrl: "/images/logos/atlas.webp",
  },
];

export function getTeamById(id: string) {
  return TEAMS.find((t) => t.id === id) ?? null;
}

export function getTeamByName(name: string) {
  const key = name.trim().toLowerCase();
  return TEAMS.find((t) => t.name.trim().toLowerCase() === key) ?? null;
}

export function getTeamName(id: string) {
  return getTeamById(id)?.name ?? id;
}

export function getTeamLogoUrlById(id: string) {
  return getTeamById(id)?.logoUrl ?? null;
}

/**
 * Migración: si antes guardabas el nombre (ej. "Barcelona"), intenta convertirlo a id.
 */
export function inferTeamIdFromName(name: string): string | null {
  return getTeamByName(name)?.id ?? null;
}

export function assertUniqueTeamIds() {
  const ids = TEAMS.map((t) => t.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new Error(
      "TEAMS contiene ids duplicados. Asegura que cada team.id sea único."
    );
  }
}
