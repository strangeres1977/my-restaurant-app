import Footer from "../components/footer";

type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
};

type Props = {
  restaurant: {
    slug: string;
    name: string;
    description?: string | null;
    contactEmail?: string | null;
    openingHours?: string | null;
  };
  dishes: Dish[];
};

function money(v: number) {
  try {
    return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  } catch {
    return `${v} €`;
  }
}

export default function TemplateCatalog({ restaurant, dishes }: Props) {
  return (
    <>
      <div className="p-5 md:p-8">
        <h1 className="text-3xl md:text-4xl">{restaurant.name}</h1>

        <p className="mt-3 text-[rgb(var(--fg))]/70">
          {restaurant.description || "presentación pendiente de configurar"}
        </p>

        <div className="mt-10">
          <h2 className="text-lg">productos destacados</h2>

          {dishes.length ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {dishes.slice(0, 8).map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border bg-[rgb(var(--card))] p-4"
                >
                  {d.imageUrl ? (
                    <img
                      src={d.imageUrl}
                      alt={d.name}
                      className="mb-3 h-32 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="flex justify-between gap-4">
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
            <p className="mt-3 text-sm text-[rgb(var(--fg))]/60">
              aún no hay productos
            </p>
          )}
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
