import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            stadium: true,
          },
        },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(competition);
  } catch (error) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { error: "Error fetching competition" },
      { status: 500 }
    );
  }
}
