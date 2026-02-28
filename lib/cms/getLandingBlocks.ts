import { prisma } from "@/lib/prisma";

export async function getLandingBlocksBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!restaurant) return [];

  try {
    return await prisma.contentBlock.findMany({
      where: {
        restaurantId: restaurant.id,
        page: "LANDING",
      },
      orderBy: { sort: "asc" },
    });
  } catch (e: any) {
    // estabilidad máxima: si la tabla aún no existe, no rompemos la landing
    const msg = String(e?.message || e);
    if (msg.includes("does not exist") && msg.includes("ContentBlock")) {
      return [];
    }
    throw e;
  }
}

