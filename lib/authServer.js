import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getAuthFromCookie() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return { ok: false, role: null, userId: null };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, role: payload.role ?? null, userId: payload.userId ?? null };
  } catch (e) {
    return { ok: false, role: null, userId: null };
  }
}
