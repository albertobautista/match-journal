import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        stadium: true,
        images: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Error fetching match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Primero eliminar las imágenes asociadas
    await prisma.matchImage.deleteMany({
      where: { matchId: id },
    });

    // Luego eliminar el match
    const match = await prisma.match.delete({
      where: { id },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Error deleting match" },
      { status: 500 }
    );
  }
}
