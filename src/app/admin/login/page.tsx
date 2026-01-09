"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setError("Token inválido");
        return;
      }

      // Redirigir a teams después de login exitoso
      router.push("/admin/teams");
    } catch (err) {
      setError("Error al verificar token");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl border-white/10 bg-white/5 p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h1 className="text-2xl font-semibold text-white">Panel Admin</h1>
            <p className="text-sm text-zinc-400">
              Ingresa tu token para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-zinc-300">
                Token de acceso
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="Ingresa tu token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                className="rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-600/90 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Acceder"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
