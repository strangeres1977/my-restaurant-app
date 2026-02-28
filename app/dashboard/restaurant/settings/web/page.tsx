import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import WebSettingsForm from "./web-settings-form";

type JwtPayload = {
  role?: "SUPER_ADMIN" | "PROJECT_OWNER" | "RESTAURANT_OWNER" | "USER";
  userId?: string;
};

export default async function WebSettingsPage() {
  const token = cookies().get("auth-token")?.value;
  if (!token) redirect("/login");

  let payload: JwtPayload | null = null;
  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
    payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch {
    redirect("/login");
  }

  if (!payload?.role || !payload?.userId) redirect("/login");
  if (payload.role !== "PROJECT_OWNER" && payload.role !== "RESTAURANT_OWNER" && payload.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // owner: cargamos su restaurante por userId
  // super admin: por ahora también cargamos el primero para no bloquearte.
  // luego si quieres, lo hacemos por selector de restaurante.
  const restaurant =
    (payload.role === "PROJECT_OWNER" || payload.role === "RESTAURANT_OWNER")
      ? await prisma.restaurant.findFirst({
          where: { userId: payload.userId },
          select: {
            slug: true,
            name: true,
            description: true,
            themeColor: true,
            bannerUrl: true,
            logoUrl: true,
            contactEmail: true,
          },
        })
      : await prisma.restaurant.findFirst({
          select: {
            slug: true,
            name: true,
            description: true,
            themeColor: true,
            bannerUrl: true,
            logoUrl: true,
            contactEmail: true,
          },
        });

  if (!restaurant) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>web pública</h1>
        <p style={{ opacity: 0.75, marginTop: 10 }}>
          no encuentro restaurante asociado a este usuario.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>web pública</h1>
      <p style={{ opacity: 0.75, marginTop: 10 }}>
        aquí puedes editar banner, logo, color, descripción y email.
      </p>

      <div style={{ marginTop: 14 }}>
        <WebSettingsForm
          role={payload.role}
          restaurant={restaurant}
        />
      </div>
    </main>
  );
}
