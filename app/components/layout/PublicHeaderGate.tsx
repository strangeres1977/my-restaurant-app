"use client";

import { usePathname } from "next/navigation";

export default function PublicHeaderGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // en dashboard no mostramos header público
  if (pathname?.startsWith("/dashboard")) return null;

  return <>{children}</>;
}
