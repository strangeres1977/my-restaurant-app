import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/services/rateLimit";

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();

    const { restaurantSlug, name, email, subject, message } = body || {};

    if (!restaurantSlug || !name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos (restaurantSlug, name, email, message)" },
        { status: 400 }
      );
    }

    // anti-spam: 5 envíos por minuto por IP+restaurante
    const rl = await rateLimit({
      key: `${ip}:${restaurantSlug}`,
      windowSeconds: 60,
      max: 5,
    });

    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 1 minuto y prueba otra vez." },
        { status: 429 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const saved = await prisma.contactMessage.create({
      data: {
        restaurantId: restaurant.id,
        name,
        email,
        subject: subject || null,
        message,
        read: false,
      },
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}
