import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = body?.token;
  const password = body?.password;

  if (!token || !password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
