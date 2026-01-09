"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

type Team = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: string;
};

export default function AdminTeamsPage() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetch("/api/teams", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load teams");
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete team");
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Error al eliminar el equipo");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestionar equipos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Crea, edita y elimina equipos del sistema
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
        >
          <Link href="/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo equipo
          </Link>
        </Button>
      </div>

      {/* Teams list */}
      <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
        {loading ? (
          <div className="text-center text-sm text-zinc-400">Cargando...</div>
        ) : teams.length === 0 ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-zinc-400">No hay equipos aún</p>
            <Button
              asChild
              size="sm"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Link href="/teams/new">
                <Plus className="mr-2 h-3 w-3" />
                Crear el primer equipo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team, idx) => (
              <React.Fragment key={team.id}>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    {team.logoUrl ? (
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                        <Image
                          src={team.logoUrl}
                          alt={team.name}
                          width={40}
                          height={40}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                        <span className="text-xl">⚽</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-zinc-100">
                        {team.name}
                      </div>
                      <div className="text-xs text-zinc-500">{team.id}</div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(team.id)}
                    disabled={deleting === team.id}
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {idx < teams.length - 1 && <Separator className="bg-white/5" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </Card>

      {/* Info */}
      <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
        <div className="text-xs text-zinc-400 space-y-2">
          <p>
            <strong>Total de equipos:</strong> {teams.length}
          </p>
          <p>
            Esta es una interfaz administrativa protegida. Solo los usuarios con
            el token correcto pueden acceder.
          </p>
        </div>
      </Card>
    </div>
  );
}
