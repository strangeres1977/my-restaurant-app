import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type LoginBody = { email?: string; password?: string };

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(
  req: Request,
  { params }: { params: { restaurant: string } }
) {
  try {
    const slug = params.restaurant;
    const body = (await req.json()) as LoginBody;

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!slug) return jsonError("Proyecto inválido.", 400);
    if (!email || !password) return jsonError("Email y contraseña son obligatorios.", 400);

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true, slug: true, userId: true },
    });

    if (!restaurant) return jsonError("No existe un proyecto con ese enlace.", 404);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });

    if (!user) return jsonError("Credenciales incorrectas.", 401);

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) return jsonError("Credenciales incorrectas.", 401);

    if (restaurant.userId !== user.id) {
      return jsonError("Tu usuario no tiene acceso a este proyecto.", 403);
    }

    if (user.role !== "PROJECT_OWNER" && user.role !== "RESTAURANT_OWNER") {
      return jsonError("Este acceso es solo para clientes. Usa /login.", 403);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return jsonError("Falta configurar JWT_SECRET.", 500);

    const payload = {
      userId: user.id,
      role: "PROJECT_OWNER",
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return jsonError("Error inesperado al iniciar sesión.", 500);
  }
}
