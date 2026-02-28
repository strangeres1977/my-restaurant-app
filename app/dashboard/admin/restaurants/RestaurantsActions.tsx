"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RestaurantsActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard/admin">
        <Button variant="secondary" size="sm">volver</Button>
      </Link>

      <Button
        size="sm"
        onClick={() => alert("pendiente: modal/alta restaurante")}
      >
        nuevo proyecto
      </Button>
    </div>
  );
}
