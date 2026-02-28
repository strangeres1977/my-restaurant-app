"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function DashboardSidebar({
  title,
  links,
}: {
  title: string;
  links: NavLink[];
}) {
  const pathname = usePathname() || "";

  const matches = links
    .map((l) => {
      const isExact = pathname === l.href;
      const isPrefix = pathname.startsWith(l.href + "/");
      const isMatch = isExact || isPrefix;
      return { href: l.href, isMatch, len: l.href.length };
    })
    .filter((m) => m.isMatch);

  const activeHref =
    matches.sort((a, b) => b.len - a.len)[0]?.href ?? null;

  return (
    <aside>
      <div className="rounded-2xl border bg-[rgb(var(--card))] shadow-[var(--shadow-sm)]">
        <div className="border-b px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-fg))]">
            {title}
          </div>
          <div className="text-[11px] text-[rgb(var(--muted-fg))]">dashboard</div>
        </div>

        <nav className="p-2">
          {links.map((l) => {
            const active = activeHref === l.href;

            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm no-underline hover:no-underline transition",
                  active
                    ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-fg))]"
                    : "hover:bg-[rgb(var(--accent))]",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

