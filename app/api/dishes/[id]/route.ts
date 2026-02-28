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

async function assertCanTouchDish(payload: JwtPayload, dishId: string) {
  const role = payload.role;
  const userId = payload.userId;

  if (!role || !userId) return { error: json(401, { error: "invalid session" }) };
  if (role !== "SUPER_ADMIN" && role !== "PROJECT_OWNER" && role !== "RESTAURANT_OWNER") {
    return { error: json(403, { error: "forbidden" }) };
  }

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { restaurant: { select: { slug: true, userId: true } } },
  });

  if (!dish) return { error: json(404, { error: "dish not found" }) };

  if (role === "PROJECT_OWNER" || role === "RESTAURANT_OWNER") {
    if (payload.restaurantId && payload.restaurantId !== dish.restaurantId) {
      return { error: json(403, { error: "forbidden" }) };
    }
    if (dish.restaurant.userId !== userId) {
      return { error: json(403, { error: "forbidden" }) };
    }
  }

  return { dish };
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const auth = getAuth();
  if ("error" in auth) return auth.error;

  const id = ctx.params.id;
  const check = await assertCanTouchDish(auth.payload, id);
  if ("error" in check) return check.error;

  const body = await req.json().catch(() => null);
  if (!body) return json(400, { error: "invalid json" });

  const data: any = {};

  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) return json(400, { error: "name requerido" });
    data.name = name;
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return json(400, { error: "price inválido" });
    data.price = price;
  }

  if (body.description !== undefined) data.description = body.description == null ? null : String(body.description);
  if (body.category !== undefined) data.category = body.category == null ? null : String(body.category);
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl == null ? null : String(body.imageUrl);
  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (body.sort !== undefined) {
    const sort = Number(body.sort);
    if (!Number.isFinite(sort) || sort < 0) return json(400, { error: "sort inválido" });
    data.sort = sort;
  }

  if (!Object.keys(data).length) return json(400, { error: "no changes" });

  const updated = await prisma.dish.update({ where: { id }, data });

  const slug = check.dish.restaurant.slug;
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/productos`);

  return json(200, { dish: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const auth = getAuth();
  if ("error" in auth) return auth.error;

  const id = ctx.params.id;
  const check = await assertCanTouchDish(auth.payload, id);
  if ("error" in check) return check.error;

  await prisma.dish.delete({ where: { id } });

  const slug = check.dish.restaurant.slug;
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/productos`);

  return json(200, { success: true });
}
