import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        stadium: true,
        images: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Error fetching matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      date,
      time,
      city,
      notes,
      homeTeamId,
      awayTeamId,
      competitionId,
      stadiumId,
      homeScore,
      awayScore,
      videoUrl,
      imageUrls,
      costAmount,
      costCurrency,
    } = body;

    // Validar campos requeridos
    if (!date || !homeTeamId || !awayTeamId || !competitionId || !stadiumId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Crear el match
    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        time: time || null,
        city: city || null,
        notes: notes || null,
        homeTeamId,
        awayTeamId,
        competitionId,
        stadiumId,
        homeScore:
          homeScore !== null && homeScore !== undefined ? homeScore : null,
        awayScore:
          awayScore !== null && awayScore !== undefined ? awayScore : null,
        videoUrl: videoUrl || null,
        costAmount: costAmount || null,
        costCurrency: costCurrency || null,
        images:
          imageUrls && imageUrls.length > 0
            ? {
                createMany: {
                  data: imageUrls.map((url: string) => ({ url })),
                },
              }
            : undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        stadium: true,
        images: true,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Error creating match" },
      { status: 500 }
    );
  }
}
