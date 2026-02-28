import Link from "next/link";

type Props = {
  slug: string;
  contactEmail?: string | null;
  openingHours?: string | null;
};

export default function Footer({ slug, contactEmail, openingHours }: Props) {
  return (
    <footer className="mt-10 border-t border bg-[rgb(var(--card))]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm text-[rgb(var(--fg))]/60">contacto</div>
            <div className="mt-2 text-[rgb(var(--fg))]/80">
              {contactEmail || "sin email"}
            </div>
          </div>

          <div>
            <div className="text-sm text-[rgb(var(--fg))]/60">horario</div>
            <div className="mt-2 text-[rgb(var(--fg))]/80">
              {openingHours || "pendiente de configurar"}
            </div>
          </div>

          <div>
            <div className="text-sm text-[rgb(var(--fg))]/60">enlaces</div>
            <div className="mt-2 flex flex-col gap-2">
              <Link className="text-sm text-[rgb(var(--fg))]/80 hover:text-[rgb(var(--fg))]" href={`/${slug}/productos`}>
                productos
              </Link>
              <Link className="text-sm text-[rgb(var(--fg))]/80 hover:text-[rgb(var(--fg))]" href={`/${slug}/pedido`}>
                pedido
              </Link>
              <Link className="text-sm text-[rgb(var(--fg))]/80 hover:text-[rgb(var(--fg))]" href={`/${slug}/contacto`}>
                contacto
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-[rgb(var(--fg))]/35">
          tenant: {slug}
        </div>
      </div>
    </footer>
  );
}
