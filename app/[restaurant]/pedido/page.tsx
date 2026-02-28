import Link from "next/link";

export default function PedidoPage({ params }: { params: { restaurant: string } }) {
  const slug = params.restaurant;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] p-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-2xl">pedido</div>
        <div className="mt-2 text-[rgb(var(--fg))]/70">
          placeholder del flujo de pedido. aquí haremos el checkout básico cuando toque.
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-[rgb(var(--fg))]/80">estado</div>
          <div className="mt-2 text-[rgb(var(--fg))]/60">
            aún no implementado, pero ya no hay 404 y el usuario ve algo decente.
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/${slug}`}
            className="rounded-2xl px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10"
          >
            volver
          </Link>
          <Link
            href={`/${slug}/productos`}
            className="rounded-2xl px-5 py-3 border border-white/10 bg-white/10 hover:bg-white/15"
          >
            ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}
