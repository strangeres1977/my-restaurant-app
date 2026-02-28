"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { updateRestaurantAction } from "./actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type State = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<
    "name" | "slug" | "description" | "themeColor" | "bannerUrl" | "logoUrl" | "contactEmail",
    string
  >>;
  values?: Record<string, string>;
};

const initialState: State = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "guardando..." : "guardar cambios"}
    </Button>
  );
}

export default function EditRestaurantForm({
  restaurant,
}: {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    themeColor: string | null;
    bannerUrl: string | null;
    logoUrl: string | null;
    contactEmail: string | null;
  };
}) {
  const [state, action] = useFormState(updateRestaurantAction as any, initialState);
  const [uploading, setUploading] = useState<null | "logo" | "banner">(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const v = (key: string, fallback: string) =>
    state.values?.[key] !== undefined ? state.values[key] : fallback;

  async function upload(type: "logo" | "banner", file: File) {
    setUploadError(null);
    setUploading(type);
    try {
      const fd = new FormData();
      fd.append("restaurantId", restaurant.id);
      fd.append("type", type);
      fd.append("file", file);

      const res = await fetch("/api/uploads/restaurant-image", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "error subiendo");

      const url = String(data.url || "");
      const input = document.querySelector<HTMLInputElement>(`input[name="${type}Url"]`);
      if (input) input.value = url;
    } catch (e: any) {
      setUploadError(e?.message || "error subiendo archivo");
    } finally {
      setUploading(null);
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-1">
        <div className="text-xl font-semibold">editar proyecto</div>
        <div className="text-sm text-muted-foreground">
          web actual: /{restaurant.slug}
        </div>
      </div>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={restaurant.id} />

        {state.message ? (
          <div className="rounded-xl border bg-white p-3 text-sm text-red-600">
            {state.message}
          </div>
        ) : null}

        {uploadError ? (
          <div className="rounded-xl border bg-white p-3 text-sm text-red-600">
            {uploadError}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">nombre</label>
          <Input id="name" name="name" defaultValue={v("name", restaurant.name)} autoComplete="off" />
          {state.fieldErrors?.name ? <p className="text-sm text-red-600">{state.fieldErrors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="slug">slug</label>
          <Input id="slug" name="slug" defaultValue={v("slug", restaurant.slug)} autoComplete="off" />
          {state.fieldErrors?.slug ? <p className="text-sm text-red-600">{state.fieldErrors.slug}</p> : null}
          <p className="text-xs text-muted-foreground">web: /{v("slug", restaurant.slug)}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">descripción</label>
          <Input
            id="description"
            name="description"
            defaultValue={v("description", restaurant.description ?? "")}
            autoComplete="off"
            placeholder="texto corto para la home"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="themeColor">themeColor</label>
            <Input
              id="themeColor"
              name="themeColor"
              defaultValue={v("themeColor", restaurant.themeColor ?? "")}
              autoComplete="off"
              placeholder="#22c55e"
            />
            {state.fieldErrors?.themeColor ? <p className="text-sm text-red-600">{state.fieldErrors.themeColor}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="contactEmail">contactEmail</label>
            <Input
              id="contactEmail"
              name="contactEmail"
              defaultValue={v("contactEmail", restaurant.contactEmail ?? "")}
              autoComplete="off"
              placeholder="email de contacto"
            />
            {state.fieldErrors?.contactEmail ? <p className="text-sm text-red-600">{state.fieldErrors.contactEmail}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="bannerUrl">bannerUrl</label>
          <Input
            id="bannerUrl"
            name="bannerUrl"
            defaultValue={v("bannerUrl", restaurant.bannerUrl ?? "")}
            autoComplete="off"
            placeholder="https://... o /uploads/..."
          />
          {state.fieldErrors?.bannerUrl ? <p className="text-sm text-red-600">{state.fieldErrors.bannerUrl}</p> : null}

          <div className="mt-2 flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload("banner", f);
              }}
            />
            <div className="text-xs text-muted-foreground">
              {uploading === "banner" ? "subiendo banner..." : "sube una imagen desde tu pc"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="logoUrl">logoUrl</label>
          <Input
            id="logoUrl"
            name="logoUrl"
            defaultValue={v("logoUrl", restaurant.logoUrl ?? "")}
            autoComplete="off"
            placeholder="https://... o /uploads/..."
          />
          {state.fieldErrors?.logoUrl ? <p className="text-sm text-red-600">{state.fieldErrors.logoUrl}</p> : null}

          <div className="mt-2 flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload("logo", f);
              }}
            />
            <div className="text-xs text-muted-foreground">
              {uploading === "logo" ? "subiendo logo..." : "sube una imagen desde tu pc"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SubmitButton />
          <a
            href="/dashboard/admin/restaurants"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            volver
          </a>
          <a
            href={`/${restaurant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ver web
          </a>
        </div>
      </form>
    </Card>
  );
}
