const SETTINGS_KEY = "match-journal:settings:v1";

export type AppSettings = {
  favoriteTeamId: string | null;
};

const DEFAULTS: AppSettings = {
  favoriteTeamId: null,
};

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;

  const parsed = safeParse(window.localStorage.getItem(SETTINGS_KEY));
  if (!parsed || typeof parsed !== "object") return DEFAULTS;

  return {
    favoriteTeamId:
      typeof (parsed as Record<string, unknown>).favoriteTeamId === "string"
        ? ((parsed as Record<string, unknown>).favoriteTeamId as string)
        : null,
  };
}

export function setAppSettings(next: AppSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function setFavoriteTeamId(teamId: string | null) {
  const current = getAppSettings();
  setAppSettings({ ...current, favoriteTeamId: teamId });
}
