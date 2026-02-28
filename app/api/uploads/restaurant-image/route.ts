import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

function safeExt(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
  return allowed.has(ext) ? ext : "";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const restaurantId = String(form.get("restaurantId") ?? "").trim();
    const type = String(form.get("type") ?? "").trim(); // logo | banner
    const file = form.get("file");

    if (!restaurantId) return NextResponse.json({ error: "restaurantId requerido" }, { status: 400 });
    if (type !== "logo" && type !== "banner") return NextResponse.json({ error: "type inválido" }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: "file requerido" }, { status: 400 });

    const ext = safeExt(file.name);
    if (!ext) return NextResponse.json({ error: "formato no permitido" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "archivo demasiado grande (máx 5MB)" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", "restaurants", restaurantId);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${type}${ext}`;
    const dest = path.join(dir, filename);
    await fs.writeFile(dest, bytes);

    const url = `/uploads/restaurants/${restaurantId}/${filename}?v=${crypto.randomUUID()}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "error subiendo archivo" }, { status: 500 });
  }
}
