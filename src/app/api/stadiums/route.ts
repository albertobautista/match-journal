import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const stadiums = await prisma.stadium.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stadiums);
  } catch (error) {
    console.error("Error fetching stadiums:", error);
    return NextResponse.json(
      { error: "Error fetching stadiums" },
      { status: 500 }
    );
  }
}
