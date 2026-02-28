import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function AdminRestaurantsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) redirect("/dashboard");

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect("/dashboard");
  }

  if (payload.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">proyectos</h1>
            <p className="text-sm text-muted-foreground">
              gestión de tenants y acceso a la web pública
            </p>
          </div>

          <Link
            href="/dashboard/admin/restaurants/new"
            className="rounded-2xl px-4 py-2 text-sm border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))]"
          >
            nuevo proyecto
          </Link>
        </div>

        <Card className="hidden md:block overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--muted))]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">nombre</th>
                <th className="px-4 py-3 text-left font-medium">slug</th>
                <th className="px-4 py-3 text-left font-medium">owner</th>
                <th className="px-4 py-3 text-right font-medium">acciones</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-[rgb(var(--muted))]/40"
                >
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    /{r.slug}
                  </td>
                  <td className="px-4 py-3">
                    {r.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                      >
                        ver web
                      </Link>

                      <Link
                        href={`/dashboard/admin/restaurants/${r.id}`}
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                      >
                        editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {restaurants.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    no hay proyectos todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="md:hidden space-y-4">
          {restaurants.map((r) => (
            <Card key={r.id} className="p-4 space-y-2">
              <div className="text-base">{r.name}</div>
              <div className="text-sm text-muted-foreground">
                /{r.slug}
              </div>
              <div className="text-sm">
                owner: {r.user?.email ?? "—"}
              </div>

              <div className="pt-2 flex gap-4">
                <Link
                  href={`/${r.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  ver web
                </Link>

                <Link
                  href={`/dashboard/admin/restaurants/${r.id}`}
                  className="text-sm underline"
                >
                  editar
                </Link>
              </div>
            </Card>
          ))}

          {restaurants.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              no hay proyectos todavía
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
