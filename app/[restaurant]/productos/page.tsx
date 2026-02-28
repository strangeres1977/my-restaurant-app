import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TopMenu from "../components/top-menu";
import Footer from "../components/footer";

function money(v: number) {
  try {
    return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  } catch {
    return `${v} €`;
  }
}

export default async function ProductosPage({ params }: { params: { restaurant: string } }) {
  const slug = params.restaurant;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      themeColor: true,
      bannerUrl: true,
      logoUrl: true,
      contactEmail: true,
      openingHours: true,
    },
  });

  if (!restaurant) notFound();

  const dishes = await prisma.dish.findMany({
    where: { restaurantId: restaurant.id, isActive: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]" style={{ ["--accent" as any]: restaurant.themeColor }}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div className="relative overflow-hidden rounded-3xl border border bg-[rgb(var(--card))]">
          <div className="px-5 md:px-8 pt-4 flex items-start justify-between gap-4">
            <div className="text-sm text-[rgb(var(--fg))]/70">{restaurant.name}</div>
            <TopMenu slug={restaurant.slug} />
          </div>

          <div className="p-5 md:p-8">
            <h1 className="text-2xl">productos</h1>

            {dishes.length ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {dishes.map((d) => (
                  <div key={d.id} className="rounded-2xl border border bg-[rgb(var(--card))] p-4">
                    {d.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="mb-3 h-32 w-full rounded-xl object-cover"
                      />
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <div>
                        <div>{d.name}</div>
                        <div className="text-sm text-[rgb(var(--fg))]/60">
                          {d.description || "sin descripción"}
                        </div>
                        {d.category ? (
                          <div className="mt-1 text-xs text-[rgb(var(--fg))]/40">
                            {d.category}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-sm">{money(d.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[rgb(var(--fg))]/60">aún no hay productos</p>
            )}
          </div>

          <Footer
            slug={restaurant.slug}
            contactEmail={restaurant.contactEmail}
            openingHours={restaurant.openingHours}
          />
        </div>
      </div>
    </div>
  );
}
