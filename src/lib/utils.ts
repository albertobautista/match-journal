import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      // /watch?v=
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      // /shorts/<id>
      const shortsMatch = u.pathname.match(/\/shorts\/([^/]+)/);
      if (shortsMatch?.[1])
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;

      // /embed/<id>
      const embedMatch = u.pathname.match(/\/embed\/([^/]+)/);
      if (embedMatch?.[1])
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function isLikelyImageUrl(url: string) {
  return /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(url);
}
