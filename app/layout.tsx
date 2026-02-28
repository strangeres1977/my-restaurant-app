import "./globals.css";
import type { Metadata } from "next";
import PublicHeaderGate from "@/app/components/layout/PublicHeaderGate";

export const metadata: Metadata = {
  title: "Projects Platform",
  description: "Plataforma de restaurantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <PublicHeaderGate>
          <header className="topbar">
            <nav className="topbar-inner">
              <div className="topbar-brand">Projects Platform</div>
              <div className="topbar-links">
                <a href="/">Home</a>
                <a href="/dashboard">Panel</a>
                <a href="/dashboard/admin/restaurants" className="btn btn-ghost">Admin</a>
              </div>
            </nav>
          </header>
        </PublicHeaderGate>

        {children}
      </body>
    </html>
  );
}

