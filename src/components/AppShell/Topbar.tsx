"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-zinc-400">
        Añade tus partidos, media y estadísticas.
      </div>

      <div className="flex items-center gap-2">
        <Button
          asChild
          className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
        >
          <Link href="/matches/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Match
          </Link>
        </Button>

        <Button
          variant="secondary"
          className="rounded-xl bg-white/5 hover:bg-white/10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
