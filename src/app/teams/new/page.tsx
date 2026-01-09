"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewTeamPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    logoUrl: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim()) {
      setError("El nombre del equipo es requerido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ""}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear el equipo");
      }

      setSuccess(true);
      setFormData({ name: "", logoUrl: "" });

      setTimeout(() => {
        router.push("/admin/teams");
      }, 1500);
    } catch (e: any) {
      setError(e?.message || "Error al crear el equipo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/teams">
          <Button variant="ghost" size="sm" className="hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Crear nuevo equipo</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Añade un nuevo equipo a la base de datos
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-white/10 bg-white/5 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del equipo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-zinc-100">
              Nombre del equipo *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ej: Real Madrid"
              className="rounded-xl border-white/10 bg-white/5 placeholder-zinc-500"
              disabled={loading}
            />
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label
              htmlFor="logoUrl"
              className="text-sm font-medium text-zinc-100"
            >
              URL del logo (opcional)
            </Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
              className="rounded-xl border-white/10 bg-white/5 placeholder-zinc-500"
              disabled={loading}
            />
            <p className="text-xs text-zinc-400">
              Proporciona la URL completa del logo del equipo
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-sm text-emerald-200">
                ¡Equipo creado exitosamente! Redirigiendo...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Creando..." : "Crear equipo"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl bg-white/5 hover:bg-white/10"
              disabled={loading}
              asChild
            >
              <Link href="/admin/teams">Cancelar</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
