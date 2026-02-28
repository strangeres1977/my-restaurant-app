import Footer from "../components/footer";

type Props = {
  restaurant: {
    slug: string;
    name: string;
    description?: string | null;
    contactEmail?: string | null;
    openingHours?: string | null;
  };
};

export default function TemplateInfo({ restaurant }: Props) {
  return (
    <>
      <div className="p-5 md:p-8">
        <h1 className="text-3xl md:text-4xl">{restaurant.name}</h1>

        <p className="mt-3 text-[rgb(var(--fg))]/70 leading-relaxed">
          {restaurant.description || "contenido informativo pendiente"}
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5">bloque informativo</div>
          <div className="rounded-2xl border p-5">cómo funciona</div>
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
