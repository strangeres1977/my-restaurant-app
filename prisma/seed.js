const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-restaurante' },
    update: {},
    create: {
      slug: 'demo-restaurante',
      name: 'La Tasca de Pepe',
      description: 'Cocina mediterránea',
      themeColor: '#FF6B35',
      contactEmail: 'info@tasca.com',
      userId: admin.id,
    },
  });

  await prisma.dish.createMany({
    data: [
      { name: 'Paella Valenciana', price: 14.50, category: 'Arroces', restaurantId: restaurant.id },
      { name: 'Pulpo a la Gallega', price: 18.00, category: 'Entrantes', restaurantId: restaurant.id },
    ],
  });

  console.log('✅ Seed completado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
