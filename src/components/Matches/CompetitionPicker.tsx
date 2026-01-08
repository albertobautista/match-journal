"use client";

import * as React from "react";
import { Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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

export type CompetitionOption = {
  id: string;
  name: string;
  shortName?: string;
  region?: string;
};

export function CompetitionPicker({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  placeholder: string;
  value: CompetitionOption | null;
  onChange: (c: CompetitionOption) => void;
  options: CompetitionOption[];
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
            className="h-auto w-full justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left text-zinc-100 hover:bg-white/10"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Trophy className="h-5 w-5 text-zinc-200" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {value?.name ?? placeholder}
                </div>
                <div className="truncate text-xs text-zinc-400">
                  {value?.region ?? "Selecciona una competición"}
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
            <CommandInput
              placeholder="Buscar competición..."
              className="h-10"
            />
            <CommandEmpty>No encontré esa competición.</CommandEmpty>

            <CommandGroup className="max-h-85 overflow-auto">
              {options.map((c) => {
                const selected = value?.id === c.id;

                return (
                  <CommandItem
                    key={c.id}
                    value={`${c.name} ${c.shortName ?? ""} ${c.region ?? ""}`}
                    onSelect={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className="rounded-xl aria-selected:bg-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {c.name}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {c.region ?? "—"}{" "}
                        {c.shortName ? `• ${c.shortName}` : ""}
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
