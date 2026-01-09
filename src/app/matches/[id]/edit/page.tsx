import { redirect } from "next/navigation";
import MatchForm from "@/components/Matches/MatchForm";
import { prisma } from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Obtener el match
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
    redirect("/matches");
  }

  return <MatchForm initialMatch={match} />;
}
