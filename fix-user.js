const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = 'admin123';
  const hash = bcrypt.hashSync(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: { password: hash },
    create: {
      email: 'admin@restaurant.com',
      password: hash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Usuario arreglado:');
  console.log(`Email: ${user.email}`);
  console.log(`Contraseña: admin123`);
  console.log(`Role: ${user.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
