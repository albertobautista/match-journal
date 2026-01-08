"use client";

import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
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

export type StadiumOption = {
  name: string;
  city?: string;
  imageSrc: string; // /public path
};

function StadiumCard({
  label,
  value,
  placeholder,
  error,
}: {
  label: string;
  value?: StadiumOption | null;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-zinc-200">{label}</div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:bg-white/10">
        <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          {/* mini thumbnail del estadio */}
          <Image
            src={value?.imageSrc ?? "/stadiums/default.jpg"}
            alt={value?.name ?? "stadium"}
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-zinc-100">
            {value?.name ?? placeholder}
          </div>
          <div className="text-xs text-zinc-400">
            {value?.city ? value.city : "Selecciona un estadio"}
          </div>
        </div>
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function StadiumPicker({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  placeholder: string;
  value: StadiumOption | null;
  onChange: (s: StadiumOption) => void;
  options: StadiumOption[];
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full p-0 hover:bg-transparent"
        >
          <StadiumCard
            label={label}
            value={value}
            placeholder={placeholder}
            error={error}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-105 rounded-2xl border-white/10 bg-zinc-950 p-2 text-zinc-100 shadow-2xl"
      >
        <Command>
          <CommandInput placeholder="Buscar estadio..." className="h-10" />
          <CommandEmpty>No encontré ese estadio.</CommandEmpty>

          <CommandGroup className="max-h-85 overflow-auto">
            {options.map((s) => {
              const selected = value?.name === s.name;

              return (
                <CommandItem
                  key={s.name}
                  value={`${s.name} ${s.city ?? ""}`}
                  onSelect={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="rounded-xl aria-selected:bg-white/10"
                >
                  <div className="relative mr-3 h-10 w-14 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Image
                      src={s.imageSrc}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    {s.city ? (
                      <div className="text-xs text-zinc-400">{s.city}</div>
                    ) : null}
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
  );
}
