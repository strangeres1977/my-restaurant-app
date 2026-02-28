import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function contentTypeFor(ext: string) {
  switch (ext) {
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const parts = params.path || [];
    if (!parts.length) return new NextResponse("not found", { status: 404 });

    // bloquea path traversal
    if (parts.some((p) => p.includes("..") || p.includes("\\") || p.startsWith("."))) {
      return new NextResponse("bad request", { status: 400 });
    }

    // sirve desde: public/uploads/<...>
    const filePath = path.join(process.cwd(), "public", "uploads", ...parts);
    const data = await fs.readFile(filePath);

    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(ext),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
