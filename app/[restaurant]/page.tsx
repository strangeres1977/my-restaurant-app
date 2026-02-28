import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TopMenu from "./components/top-menu";
import TemplateCatalog from "./templates/template-catalog";
import TemplateBranding from "./templates/template-branding";
import TemplateInfo from "./templates/template-info";

function normalizeColor(input?: string | null) {
  if (!input) return "#22c55e";
  const c = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  if (/^#[0-9a-fA-F]{3}$/.test(c)) return c;
  return "#22c55e";
}

function isHttpUrl(url?: string | null) {
  if (!url) return false;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return true;
  if (u.startsWith("/uploads/")) return true;
  return false;
}

export default async function RestaurantHome({ params }: { params: { restaurant: string } }) {
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
      landingTemplate: true,
    },
  });

  if (!restaurant) notFound();

  const dishes =
    restaurant.landingTemplate === "CATALOG"
      ? await prisma.dish.findMany({
          where: { restaurantId: restaurant.id, isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            category: true,
            imageUrl: true,
            isFeatured: true,
            sort: true,
          },
          orderBy: [
            { isFeatured: "desc" },
            { sort: "asc" },
            { createdAt: "desc" },
          ],
        })
      : [];

  const theme = normalizeColor(restaurant.themeColor);
  const bannerOk = isHttpUrl(restaurant.bannerUrl);
  const logoOk = isHttpUrl(restaurant.logoUrl);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]" style={{ ["--accent" as any]: theme }}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div className="relative overflow-hidden rounded-3xl border border bg-[rgb(var(--card))]">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "var(--accent)" }} />
            <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-[rgb(var(--muted))] blur-3xl" />
          </div>

          <div className="relative">
            <div className="h-44 md:h-56 w-full">
              {bannerOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurant.bannerUrl as string} alt="banner" className="h-full w-full object-cover opacity-100" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[rgb(var(--accent))] to-transparent" />
              )}
            </div>

            <div className="px-5 md:px-8 pt-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border bg-[rgb(var(--bg))] overflow-hidden">
                  {logoOk ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={restaurant.logoUrl as string} alt="logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-xs text-[rgb(var(--fg))]/50">logo</div>
                  )}
                </div>
                <div className="text-sm text-[rgb(var(--fg))]/70">web demo</div>
              </div>

              <TopMenu slug={restaurant.slug} />
            </div>

            {restaurant.landingTemplate === "CATALOG" ? (
              <TemplateCatalog restaurant={restaurant} dishes={dishes} />
            ) : restaurant.landingTemplate === "BRANDING" ? (
              <TemplateBranding restaurant={restaurant} />
            ) : (
              <TemplateInfo restaurant={restaurant} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
