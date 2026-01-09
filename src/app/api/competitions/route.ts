import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return NextResponse.json(
      { error: "Error fetching competitions" },
      { status: 500 }
    );
  }
}
