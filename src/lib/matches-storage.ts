// FILE: src/lib/matches-storage.ts

import { inferCompetitionIdFromName } from "@/lib/competitions";
import { inferTeamIdFromName } from "@/lib/teams";

const STORAGE_KEY = "match-journal:v1";

export type StoredMatch = {
  id: string;
  createdAt: string;

  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;

  date: string; // YYYY-MM-DD
  time: string; // HH:mm

  stadium:
    | string
    | {
        id: string;
        name: string;
        city?: string;
        country?: string;
        imageUrl?: string | null;
        createdAt?: string;
        updatedAt?: string;
      };
  city: string;

  homeScore: number | null;
  awayScore: number | null;

  costAmount: number | null;
  costCurrency: "MXN" | "USD" | "EUR";

  images: string[];
  videoUrl: string | null;
  notes: string | null;

  // legacy (para migración)
  homeTeam?: string;
  awayTeam?: string;
  competition?: string;
};

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredMatches(): StoredMatch[] {
  if (typeof window === "undefined") return [];

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];

  let changed = false;

  const migrated: StoredMatch[] = parsed.map((m: Record<string, unknown>) => {
    const next: Record<string, unknown> = { ...m };

    // ---- Competition migration (competition -> competitionId)
    if (!next.competitionId) {
      const inferred =
        typeof next.competition === "string"
          ? inferCompetitionIdFromName(next.competition)
          : null;

      changed = true;
      next.competitionId = inferred ?? String(next.competition ?? "unknown");
      delete next.competition;
    }

    // ---- Team migration (homeTeam/awayTeam -> homeTeamId/awayTeamId)
    const homeOk =
      typeof next.homeTeamId === "string" && next.homeTeamId.length > 0;
    const awayOk =
      typeof next.awayTeamId === "string" && next.awayTeamId.length > 0;

    if (!homeOk) {
      const inferredHome =
        typeof next.homeTeam === "string"
          ? inferTeamIdFromName(next.homeTeam)
          : null;

      changed = true;
      next.homeTeamId =
        inferredHome ?? String(next.homeTeamId ?? "unknown-home");
      delete next.homeTeam;
    }

    if (!awayOk) {
      const inferredAway =
        typeof next.awayTeam === "string"
          ? inferTeamIdFromName(next.awayTeam)
          : null;

      changed = true;
      next.awayTeamId =
        inferredAway ?? String(next.awayTeamId ?? "unknown-away");
      delete next.awayTeam;
    }

    // ---- Normaliza arrays/nullable
    if (!Array.isArray(next.images)) {
      next.images = [];
      changed = true;
    }
    if (typeof next.videoUrl !== "string")
      next.videoUrl = (next.videoUrl as string | null) ?? null;
    if (typeof next.notes !== "string")
      next.notes = (next.notes as string | null) ?? null;

    return next as StoredMatch;
  });

  if (changed) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  }

  return migrated;
}

export function setStoredMatches(matches: StoredMatch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function addStoredMatch(match: StoredMatch) {
  const matches = getStoredMatches();
  matches.unshift(match);
  setStoredMatches(matches);
}

export function deleteStoredMatch(id: string) {
  const matches = getStoredMatches().filter((m) => m.id !== id);
  setStoredMatches(matches);
}

export function getStoredMatchById(id: string): StoredMatch | null {
  const matches = getStoredMatches();
  return matches.find((m) => m.id === id) ?? null;
}

export function updateStoredMatch(nextMatch: StoredMatch) {
  const matches = getStoredMatches();
  const idx = matches.findIndex((m) => m.id === nextMatch.id);
  if (idx === -1) return;

  matches[idx] = nextMatch;
  setStoredMatches(matches);
}
