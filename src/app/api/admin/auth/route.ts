import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    const adminToken = process.env.ADMIN_TOKEN || "admin-secret-token";

    if (token !== adminToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Crear respuesta con cookie
    const response = NextResponse.json({ success: true });

    // Establecer cookie con el token (válida por 7 días)
    response.cookies.set({
      name: "admin_token",
      value: token,
      maxAge: 7 * 24 * 60 * 60, // 7 días
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en autenticación:", error);
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500 }
    );
  }
}
