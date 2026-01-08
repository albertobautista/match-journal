export type CompetitionId =
  | "laliga"
  | "liga_mx"
  | "liga_mx_femenil"
  | "amistoso";

export type CompetitionCatalogItem = {
  id: CompetitionId;
  name: string;
  shortName?: string;
  region?: string;
};

export const COMPETITIONS_CATALOG: CompetitionCatalogItem[] = [
  { id: "liga_mx", name: "Liga MX", region: "México" },
  { id: "liga_mx_femenil", name: "Liga MX Femenil", region: "México" },
  { id: "amistoso", name: "Amistoso", region: "Global" },
];

export function getCompetitionById(id: string) {
  return COMPETITIONS_CATALOG.find((c) => c.id === id) ?? null;
}

export function getCompetitionLabel(id: string) {
  return getCompetitionById(id)?.name ?? id;
}

/**
 * Para migrar matches viejos que guardaban competition como string (ej "LaLiga")
 */
export function inferCompetitionIdFromName(name: string): CompetitionId | null {
  const key = name.trim().toLowerCase();

  const exact = COMPETITIONS_CATALOG.find(
    (c) => c.name.trim().toLowerCase() === key
  );
  if (exact) return exact.id;

  // aliases simples

  if (key === "liga mx" || key === "ligamx") return "liga_mx";
  if (
    key === "liga mx femenil" ||
    key === "ligamx femenil" ||
    key === "ligamxfemenil"
  )
    return "liga_mx_femenil";
  if (key === "amistoso" || key === "friendly" || key === "friendlies")
    return "amistoso";
  if (key === "la liga" || key === "laliga") return "laliga";

  return null;
}
