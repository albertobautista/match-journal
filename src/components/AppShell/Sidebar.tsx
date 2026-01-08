import Link from "next/link";
import { CalendarDays, LayoutGrid, LineChart, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
          ⚽️
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Match Journal</div>
          <div className="text-xs text-zinc-400">Personal</div>
        </div>
      </div>

      <nav className="mt-2 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
