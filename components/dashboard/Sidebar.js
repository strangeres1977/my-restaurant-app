import Link from "next/link";
import { getDashboardAuth } from "../../lib/dashboardAuth";

export default function Sidebar() {
  const auth = getDashboardAuth();

  const isSuperAdmin = auth.ok && auth.role === "SUPER_ADMIN";

  const items = [
    // SUPER ADMIN
    ...(isSuperAdmin
      ? [
          { href: "/dashboard/admin/restaurants", label: "Restaurantes" },
          { href: "/dashboard/admin/orders", label: "Pedidos" },
          { href: "/dashboard/admin/messages", label: "Mensajes" },
          { href: "/dashboard/admin/settings", label: "Ajustes" },
        ]
      : []),

    // si luego quieres menú para restaurant owners, lo metemos aquí
    // { href: "/dashboard/restaurant/orders", label: "Pedidos" },
  ];

  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid #e5e7eb",
        padding: 16,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Dashboard</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {auth.ok ? auth.role : "sin sesión"}
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              textDecoration: "none",
              color: "#111827",
              background: "#f9fafb",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
