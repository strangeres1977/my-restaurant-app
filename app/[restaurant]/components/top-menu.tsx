"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = { slug: string };

export default function TopMenu({ slug }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))]"
      >
        <div className="flex flex-col gap-1">
          <span className="block h-0.5 w-4 bg-[rgb(var(--fg))]/70" />
          <span className="block h-0.5 w-4 bg-[rgb(var(--fg))]/70" />
          <span className="block h-0.5 w-4 bg-[rgb(var(--fg))]/70" />
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border bg-[rgb(var(--card))] shadow-lg">
          <div className="p-2">
            <Link
              href={`/${slug}/pedido`}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setOpen(false)}
            >
              hacer pedido
            </Link>
            <Link
              href={`/${slug}/productos`}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setOpen(false)}
            >
              ver productos
            </Link>
            <Link
              href={`/${slug}/contacto`}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setOpen(false)}
            >
              contacto
            </Link>

            <div className="my-2 h-px bg-[rgb(var(--fg))]/10" />

            <Link
              href={`/${slug}/login`}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setOpen(false)}
            >
              admin
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
