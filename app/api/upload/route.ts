import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

type JwtPayload = {
  role?: "SUPER_ADMIN" | "PROJECT_OWNER" | "RESTAURANT_OWNER" | "USER";
  userId?: string;
};

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return json(401, { error: "no auth" });

  try {
    if (!process.env.JWT_SECRET) return json(500, { error: "JWT_SECRET missing" });
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const role = payload.role;

    if (role !== "SUPER_ADMIN" && role !== "PROJECT_OWNER" && role !== "RESTAURANT_OWNER") {
      return json(403, { error: "forbidden" });
    }
  } catch {
    return json(401, { error: "invalid token" });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return json(400, { error: "invalid formdata" });

  const file = form.get("file");
  if (!file || !(file instanceof File)) return json(400, { error: "file requerido" });

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) return json(400, { error: "archivo demasiado grande (max 5MB)" });

  const ext = extFromType(file.type);
  if (!ext) return json(400, { error: "tipo no permitido (png/jpg/webp)" });

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = `img_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
  const filePath = path.join(uploadDir, safeName);

  await fs.writeFile(filePath, bytes);

  return json(200, { success: true, url: `/uploads/${safeName}` });
}
