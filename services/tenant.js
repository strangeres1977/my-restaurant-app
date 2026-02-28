const mod = require('../lib/prisma.cjs');
const prisma = mod.default ?? mod.prisma;
async function getTenantBySlug(slug) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      themeColor: true,
      bannerUrl: true,
      logoUrl: true,
      contactEmail: true,
    },
  });
  return restaurant;
}

module.exports = { getTenantBySlug };
