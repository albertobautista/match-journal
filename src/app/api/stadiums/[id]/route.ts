import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stadium = await prisma.stadium.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true,
          },
        },
      },
    });

    if (!stadium) {
      return NextResponse.json({ error: "Stadium not found" }, { status: 404 });
    }

    return NextResponse.json(stadium);
  } catch (error) {
    console.error("Error fetching stadium:", error);
    return NextResponse.json(
      { error: "Error fetching stadium" },
      { status: 500 }
    );
  }
}
