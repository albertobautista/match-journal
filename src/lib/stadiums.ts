export type StadiumCatalogItem = {
  name: string;
  city?: string;
  imageSrc: string; // ruta en /public
};

export const STADIUMS_CATALOG: StadiumCatalogItem[] = [
  {
    name: "Estadio Azteca",
    city: "Ciudad de México",
    imageSrc: "/images/stadiums/azteca.webp",
  },
  //   {
  //     name: "Santiago Bernabéu",
  //     city: "Madrid",
  //     imageSrc: "/images/logos/bernabeu.jpg",
  //   },
  //   {
  //     name: "Camp Nou",
  //     city: "Barcelona",
  //     imageSrc: "/images/logos/camp-nou.jpg",
  //   },
  {
    name: "Estadio Akron",
    city: "Guadalajara",
    imageSrc: "/images/stadiums/akron.webp",
  },
  {
    name: "Estadio Jalisco",
    city: "Guadalajara",
    imageSrc: "/images/stadiums/jalisco.webp",
  },
  //   {
  //     name: "Ramón Sánchez-Pizjuán",
  //     city: "Sevilla",
  //     imageSrc: "/images/logos/sanchez-pizjuan.jpg",
  //   },
  //   {
  //     name: "Old Trafford",
  //     city: "Manchester",
  //     imageSrc: "/images/logos/old-trafford.jpg",
  //   },
];

export function getStadiumImageSrc(
  stadium: string | { name: string }
): string | null {
  const stadiumName = typeof stadium === "string" ? stadium : stadium.name;
  const key = stadiumName.trim().toLowerCase();
  const found = STADIUMS_CATALOG.find(
    (s) => s.name.trim().toLowerCase() === key
  );
  return found?.imageSrc ?? null;
}
