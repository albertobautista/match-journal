import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        homeMatches: {
          include: {
            awayTeam: true,
            competition: true,
            stadium: true,
          },
        },
        awayMatches: {
          include: {
            homeTeam: true,
            competition: true,
            stadium: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Error fetching team" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID del equipo es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el equipo tiene partidos
    const matchesCount = await prisma.match.count({
      where: {
        OR: [{ homeTeamId: id }, { awayTeamId: id }],
      },
    });

    if (matchesCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un equipo que tiene partidos" },
        { status: 400 }
      );
    }

    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Error al eliminar equipo" },
      { status: 500 }
    );
  }
}
