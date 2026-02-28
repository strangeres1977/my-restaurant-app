import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = body?.email;

  // siempre responder ok para no filtrar si existe o no
  if (!email) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  // limpieza básica: borra tokens usados o expirados antiguos (por higiene)
  // (deja la BD limpia y reduce ruido)
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { used: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });

  // rate limit (por usuario): máx 3 solicitudes cada 15 min
  const windowMs = 15 * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  const recentCount = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: { gte: since },
    },
  });

  if (recentCount >= 3) {
    // respondemos ok igualmente para no filtrar nada
    return NextResponse.json({ ok: true });
  }

  // importante: invalida tokens anteriores no usados de este usuario (solo queda 1 válido)
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  // DEV: imprimir link (en prod lo cambias por email real)
  console.log("RESET LINK:");
  console.log(`http://127.0.0.1:3000/reset-password?token=${token}`);

  return NextResponse.json({ ok: true });
}
