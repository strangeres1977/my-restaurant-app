const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// para que funcione en ambos estilos:
module.exports = prisma;
module.exports.default = prisma;
module.exports.prisma = prisma;
