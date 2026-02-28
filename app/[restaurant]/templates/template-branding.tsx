import Footer from "../components/footer";

type Props = {
  restaurant: {
    slug: string;
    name: string;
    description?: string | null;
    bannerUrl?: string | null;
    contactEmail?: string | null;
    openingHours?: string | null;
  };
};

function isHttpUrl(url?: string | null) {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (url.startsWith("/uploads/")) return true;
  return false;
}

export default function TemplateBranding({ restaurant }: Props) {
  const bannerOk = isHttpUrl(restaurant.bannerUrl);

  return (
    <>
      <div className="p-5 md:p-8">
        <h1 className="text-3xl md:text-4xl">{restaurant.name}</h1>

        <p className="mt-3 text-[rgb(var(--fg))]/70">
          {restaurant.description || "texto pendiente de configurar"}
        </p>

        <div className="mt-8 rounded-3xl border border overflow-hidden">
          <div className="h-72">
            {bannerOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.bannerUrl as string}
                alt="banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[rgb(var(--accent))] to-transparent" />
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-5">bloque de texto 1</div>
          <div className="rounded-2xl border p-5">bloque de texto 2</div>
          <div className="rounded-2xl border p-5">bloque de texto 3</div>
        </div>
      </div>

      <Footer
        slug={restaurant.slug}
        contactEmail={restaurant.contactEmail}
        openingHours={restaurant.openingHours}
      />
    </>
  );
}
