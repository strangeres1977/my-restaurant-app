import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { Container } from "@/components/ui/container";

type NavLink = { href: string; label: string };

export default function DashboardShell({
  title,
  sidebarTitle,
  links,
  children,
}: {
  title: string;
  sidebarTitle: string;
  links: NavLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <DashboardTopbar title={title} />

      <Container className="py-6">
        <div className="flex gap-6">
          <div className="w-72 shrink-0 hidden md:block">
            <DashboardSidebar title={sidebarTitle} links={links} />
          </div>

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}

