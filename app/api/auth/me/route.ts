import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "no auth" }, { status: 401 });

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ ok: false, error: "JWT_SECRET missing" }, { status: 500 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({ ok: true, payload });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
  }
}
