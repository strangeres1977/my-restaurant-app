import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type JwtPayload = {
  role?: "SUPER_ADMIN" | "PROJECT_OWNER" | "RESTAURANT_OWNER" | "USER" | string;
  userId?: string;
  restaurantId?: string | null;
  restaurantSlug?: string | null;
};

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function getAuth(): { payload: JwtPayload } | { error: NextResponse } {
  const token = cookies().get("auth-token")?.value;
  if (!token) return { error: json(401, { error: "no auth" }) };

  try {
    if (!process.env.JWT_SECRET) return { error: json(500, { error: "JWT_SECRET missing" }) };
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    return { payload };
  } catch {
    return { error: json(401, { error: "invalid token" }) };
  }
}

async function resolveRestaurantScope(payload: JwtPayload, req: Request) {
  const role = payload.role;
  const userId = payload.userId;

  if (!role || !userId) return { error: json(401, { error: "invalid session" }) };
  if (role !== "SUPER_ADMIN" && role !== "PROJECT_OWNER" && role !== "RESTAURANT_OWNER") {
    return { error: json(403, { error: "forbidden" }) };
  }

  if (role === "PROJECT_OWNER" || role === "RESTAURANT_OWNER") {
    if (payload.restaurantId) {
      const r = await prisma.restaurant.findUnique({
        where: { id: payload.restaurantId },
        select: { id: true, slug: true, userId: true },
      });
      if (!r || r.userId !== userId) return { error: json(403, { error: "forbidden" }) };
      return { restaurantId: r.id, restaurantSlug: r.slug };
    }

    const r = await prisma.restaurant.findFirst({
      where: { userId },
      select: { id: true, slug: true },
    });
    if (!r) return { error: json(404, { error: "restaurant not found" }) };
    return { restaurantId: r.id, restaurantSlug: r.slug };
  }

  const url = new URL(req.url);
  const qRestaurantId = url.searchParams.get("restaurantId");
  const qRestaurantSlug = url.searchParams.get("restaurantSlug");

  const slug = qRestaurantSlug || payload.restaurantSlug || null;
  const rid = qRestaurantId || payload.restaurantId || null;

  if (slug) {
    const r = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true, slug: true } });
    if (!r) return { error: json(404, { error: "restaurant not found" }) };
    return { restaurantId: r.id, restaurantSlug: r.slug };
  }
  if (rid) {
    const r = await prisma.restaurant.findUnique({ where: { id: rid }, select: { id: true, slug: true } });
    if (!r) return { error: json(404, { error: "restaurant not found" }) };
    return { restaurantId: r.id, restaurantSlug: r.slug };
  }

  // super admin fallback: si no viene nada, usamos el primero para no bloquear (igual que settings/web)
  const first = await prisma.restaurant.findFirst({
    select: { id: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  if (first) return { restaurantId: first.id, restaurantSlug: first.slug };

  return { error: json(404, { error: "restaurant not found" }) };
}

export async function GET(req: Request) {
  const auth = getAuth();
  if ("error" in auth) return auth.error;

  const scope = await resolveRestaurantScope(auth.payload, req);
  if ("error" in scope) return scope.error;

  const dishes = await prisma.dish.findMany({
    where: { restaurantId: scope.restaurantId },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return json(200, { dishes });
}

export async function POST(req: Request) {
  const auth = getAuth();
  if ("error" in auth) return auth.error;

  const scope = await resolveRestaurantScope(auth.payload, req);
  if ("error" in scope) return scope.error;

  const body = await req.json().catch(() => null);
  if (!body) return json(400, { error: "invalid json" });

  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const description = body.description == null ? null : String(body.description);
  const category = body.category == null ? null : String(body.category);
  const imageUrl = body.imageUrl == null ? null : String(body.imageUrl);
  const isFeatured = Boolean(body.isFeatured);
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive);
  const sort = body.sort === undefined ? 0 : Number(body.sort);

  if (!name) return json(400, { error: "name requerido" });
  if (!Number.isFinite(price) || price < 0) return json(400, { error: "price inválido" });
  if (!Number.isFinite(sort) || sort < 0) return json(400, { error: "sort inválido" });

  const created = await prisma.dish.create({
    data: {
      restaurantId: scope.restaurantId,
      name,
      price,
      description,
      category,
      imageUrl,
      isFeatured,
      isActive,
      sort,
    },
  });

  revalidatePath(`/${scope.restaurantSlug}`);
  revalidatePath(`/${scope.restaurantSlug}/productos`);

  return json(201, { dish: created });
}
