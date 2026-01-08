"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TeamOption } from "@/lib/teams";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

export function TeamPicker({
  label,
  placeholder,
  value,
  onChange,
  options,
  tone,
  disabledTeamIds,
  error,
}: {
  label: string;
  placeholder: string;
  value: TeamOption | null;
  onChange: (t: TeamOption) => void;
  options: TeamOption[];
  tone?: "home" | "away";
  disabledTeamIds?: string[];
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      <div className="text-sm text-zinc-200">{label}</div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-auto w-full justify-between rounded-2xl border bg-white/5 px-3 py-3 text-left text-zinc-100 hover:bg-white/10",
              tone === "home" ? "border-emerald-500/15" : "border-white/10"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center overflow-hidden rounded-2xl ring-1",
                  tone === "home"
                    ? "bg-emerald-500/10 ring-emerald-500/25"
                    : "bg-white/5 ring-white/10"
                )}
              >
                {value?.logoUrl ? (
                  <Image
                    src={value.logoUrl}
                    alt={value.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <span className="text-sm">⚽️</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {value?.name ?? placeholder}
                </div>
                <div className="truncate text-xs text-zinc-400">
                  {value
                    ? `ID: ${value.id}`
                    : "Selecciona un equipo del catálogo"}
                </div>
              </div>
            </div>

            <span className="text-xs text-zinc-400">Cambiar</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-105 rounded-2xl border-white/10 bg-zinc-950 p-2 text-zinc-100 shadow-2xl"
        >
          <Command>
            <CommandInput placeholder="Buscar equipo..." className="h-10" />

            <CommandEmpty>No encontré ese equipo.</CommandEmpty>

            <CommandGroup className="max-h-85 overflow-auto">
              {options.map((t) => {
                const selected = value?.id === t.id;
                const disabled = disabledTeamIds?.includes(t.id);

                return (
                  <CommandItem
                    key={t.id}
                    value={t.name}
                    disabled={disabled}
                    onSelect={() => {
                      if (disabled) return;
                      onChange(t);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-xl aria-selected:bg-white/10",
                      disabled && "opacity-50"
                    )}
                  >
                    <div className="mr-2 grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                      {t.logoUrl ? (
                        <Image
                          src={t.logoUrl}
                          alt={t.name}
                          width={22}
                          height={22}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span className="text-sm">⚽️</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {t.name}
                      </div>
                      <div className="truncate text-xs text-zinc-400">
                        {t.id}
                      </div>
                    </div>

                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
