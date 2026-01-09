import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl border-white/10 bg-white/5 p-8 text-center">
        <div className="space-y-4">
          <div className="text-5xl">🔐</div>
          <h1 className="text-2xl font-semibold text-white">Acceso denegado</h1>
          <p className="text-sm text-zinc-400">
            No tienes permiso para acceder a esta página. Se requiere un token
            de administrador válido.
          </p>

          <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-left text-xs text-zinc-400">
            <p className="font-semibold text-zinc-300 mb-2">
              Para autorización, proporciona:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Un header{" "}
                <code className="text-emerald-400">
                  Authorization: Bearer &lt;token&gt;
                </code>
              </li>
              <li>
                O una cookie{" "}
                <code className="text-emerald-400">
                  admin_token=&lt;token&gt;
                </code>
              </li>
            </ul>
          </div>

          <Button
            asChild
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-600/90"
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
