// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  console.log("🌱 Seeding database...");

  /* =========================
     TEAMS
  ========================= */

  const teams = [
    {
      id: "chivas",
      name: "Chivas",
      logoUrl: "/images/logos/chivas.webp",
    },
    {
      id: "chivas_femenil",
      name: "Chivas Femenil",
      logoUrl: "/images/logos/chivas.webp",
    },
    {
      id: "atlas",
      name: "Atlas",
      logoUrl: "/images/logos/atlas.webp",
    },
    {
      id: "atletico_de_san_luis_femenil",
      name: "Atlético de San Luis Femenil",
      logoUrl: "/images/logos/atletico_san_luis.webp",
    },
    {
      id: "atletico_de_san_luis",
      name: "Atlético de San Luis",
      logoUrl: "/images/logos/atletico_san_luis.webp",
    },
    {
      id: "pachuca",
      name: "Pachuca",
      logoUrl: "/images/logos/pachuca.webp",
    },
    {
      id: "pachuca_femenil",
      name: "Pachuca Femenil",
      logoUrl: "/images/logos/pachuca.webp",
    },
  ];

  await prisma.team.createMany({
    data: teams,
    skipDuplicates: true,
  });

  console.log(`✅ Teams: ${teams.length}`);

  /* =========================
     COMPETITIONS
  ========================= */

  const competitions = [
    {
      id: "liga_mx",
      name: "Liga MX",
      country: "México",
    },
    {
      id: "liga_mx_femenil",
      name: "Liga MX Femenil",
      country: "México",
    },
    {
      id: "amistosos",
      name: "Amistosos",
      country: "General",
    },
  ];

  await prisma.competition.createMany({
    data: competitions,
    skipDuplicates: true,
  });

  console.log(`✅ Competitions: ${competitions.length}`);

  /* =========================
     STADIUMS
  ========================= */

  const stadiums = [
    {
      id: "akron",
      name: "Estadio Akron",
      city: "Guadalajara",
      country: "México",
      imageUrl: "/images/stadiums/akron.webp",
    },
    {
      id: "jalisco",
      name: "Estadio Jalisco",
      city: "Guadalajara",
      country: "México",
      imageUrl: "/images/stadiums/jalisco.webp",
    },
    {
      id: "azteca",
      name: "Estadio Azteca",
      city: "Ciudad de México",
      country: "México",
      imageUrl: "/images/stadiums/azteca.webp",
    },
  ];

  await prisma.stadium.createMany({
    data: stadiums,
    skipDuplicates: true,
  });

  console.log(`✅ Stadiums: ${stadiums.length}`);

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
