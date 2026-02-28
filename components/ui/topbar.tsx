import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/button";

export function Topbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b bg-[rgb(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight no-underline hover:no-underline">
          my-restaurant-app
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Panel</Button>
          </Link>
          <Link href="/dashboard/admin/restaurants">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/button";

export function Topbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b bg-[rgb(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight no-underline hover:no-underline">
          my-restaurant-app
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Panel</Button>
          </Link>
          <Link href="/dashboard/admin/restaurants">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
