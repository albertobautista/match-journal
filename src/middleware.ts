import { type NextRequest, NextResponse } from "next/server";

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ["/teams/new", "/admin"];

// Token simple para protección básica (cambiar en producción)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-secret-token";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Las rutas de login y auth no necesitan protección
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // Verificar si la ruta está protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Obtener el token del header o cookie
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("admin_token")?.value;

    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teams/new", "/admin/:path*"],
};
