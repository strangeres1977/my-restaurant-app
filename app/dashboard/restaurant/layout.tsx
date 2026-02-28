import DashboardShell from "@/app/components/dashboard/DashboardShell";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="panel proyecto"
      sidebarTitle="proyecto"
      links={[
        { href: "/dashboard/project", label: "inicio" },
        { href: "/dashboard/project/orders", label: "pedidos" },
        { href: "/dashboard/project/messages", label: "mensajes" },
        { href: "/dashboard/project/products", label: "productos" },
        { href: "/dashboard/project/settings", label: "ajustes" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
