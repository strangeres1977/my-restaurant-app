import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import LogoutButton from "./LogoutButton";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

type TokenPayload = {
  userId: string;
  role: string;
  email?: string;
};

function getUserFromCookie(): TokenPayload | null {
  const token = cookies().get("auth-token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}

export default function DashboardTopbar({ title }: { title: string }) {
  const user = getUserFromCookie();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b bg-[rgb(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60">
      <Container className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight no-underline hover:no-underline"
          >
            my-restaurant-app
          </Link>

          <div className="h-4 w-px bg-[rgb(var(--border))]" />

          <div className="text-sm text-[rgb(var(--fg))] truncate">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-[rgb(var(--muted-fg))]">
            {user?.role ?? "sin sesión"}
          </div>

          <Link href="/dashboard">
            <Button variant="ghost" size="sm">panel</Button>
          </Link>

          {isSuperAdmin ? (
            <Link href="/dashboard/admin/restaurants">
              <Button variant="ghost" size="sm">admin</Button>
            </Link>
          ) : null}

          <div className="pl-1">
            <LogoutButton />
          </div>
        </div>
      </Container>
    </header>
  );
}

