import DashboardShell from "@/app/components/dashboard/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="panel global"
      sidebarTitle="super admin"
      links={[
        { href: "/dashboard/admin", label: "inicio" },
        { href: "/dashboard/admin/restaurants", label: "proyectos" },
        { href: "/dashboard/admin/orders", label: "pedidos" },
        { href: "/dashboard/admin/messages", label: "mensajes" },
        { href: "/dashboard/admin/settings", label: "ajustes" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
