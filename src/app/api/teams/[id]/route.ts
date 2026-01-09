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
