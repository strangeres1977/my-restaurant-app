import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.contactMessage.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { restaurant: { select: { slug: true, name: true } } },
  });

  console.log(messages);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
