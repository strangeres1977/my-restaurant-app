import ProductsClient from "../../restaurant/dishes/products-client";

export default function ProjectProductsPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-2xl">productos</div>
        <div className="mt-2 text-[rgb(var(--fg))]/70">
          gestiona catálogo (activo, destacado, orden e imagen).
        </div>

        <div className="mt-6">
          <ProductsClient />
        </div>
      </div>
    </div>
  );
}
