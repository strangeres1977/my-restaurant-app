import ContactForm from "./ContactForm";

export default function ContactPage({
  params,
}: {
  params: { restaurant: string };
}) {
  const slug = params.restaurant;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 8 }}>
        contacto
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        escríbenos y te respondemos lo antes posible.
      </p>

      <ContactForm restaurantSlug={slug} />
    </main>
  );
}
