"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createRestaurantAction } from "./actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Template = "CATALOG" | "BRANDING" | "INFO";

type State = {
  ok: boolean;
  message?: string;
  warning?: string;
  fieldErrors?: Partial<Record<"name" | "slug" | "ownerEmail" | "landingTemplate", string>>;
  values?: { name?: string; slug?: string; ownerEmail?: string; landingTemplate?: Template; openingHours?: string };
};

const initialState: State = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "creando..." : "crear proyecto"}
    </Button>
  );
}

export default function NewRestaurantForm() {
  const [state, action] = useFormState(createRestaurantAction as any, initialState);
  const defaultTemplate: Template = state.values?.landingTemplate ?? "CATALOG";

  return (
    <Card className="p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">nuevo proyecto</h1>
        <p className="text-sm text-muted-foreground">
          crea un tenant nuevo por slug. puedes asignar owner por email (opcional).
        </p>
      </div>

      <form action={action} className="mt-6 space-y-5">
        {state.message ? (
          <div className="rounded-xl border bg-white p-3 text-sm">
            <div className="text-red-600">{state.message}</div>
            {state.warning ? <div className="mt-1 text-amber-600">{state.warning}</div> : null}
          </div>
        ) : state.warning ? (
          <div className="rounded-xl border bg-white p-3 text-sm text-amber-600">{state.warning}</div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">nombre</label>
          <Input
            id="name"
            name="name"
            placeholder="ej: bk pizza murcia"
            defaultValue={state.values?.name ?? ""}
            autoComplete="off"
          />
          {state.fieldErrors?.name ? <p className="text-sm text-red-600">{state.fieldErrors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="slug">slug (opcional)</label>
          <Input
            id="slug"
            name="slug"
            placeholder="ej: bk-pizza-murcia (si lo dejas vacío se genera solo)"
            defaultValue={state.values?.slug ?? ""}
            autoComplete="off"
          />
          {state.fieldErrors?.slug ? <p className="text-sm text-red-600">{state.fieldErrors.slug}</p> : null}
          <p className="text-xs text-muted-foreground">se usa para la web pública: /tu-slug</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="landingTemplate">plantilla de landing</label>
          <select
            id="landingTemplate"
            name="landingTemplate"
            defaultValue={defaultTemplate}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="CATALOG">catálogo (productos en landing)</option>
            <option value="BRANDING">branding (fotos + bloques)</option>
            <option value="INFO">informativa (texto)</option>
          </select>
          {state.fieldErrors?.landingTemplate ? (
            <p className="text-sm text-red-600">{state.fieldErrors.landingTemplate}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">solo se cambia desde superadmin.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="openingHours">horario (footer)</label>
          <Input
            id="openingHours"
            name="openingHours"
            placeholder="ej: lun-dom 12:00–16:00 / 20:00–23:30"
            defaultValue={state.values?.openingHours ?? ""}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">se muestra en el footer de la web pública.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ownerEmail">owner email (opcional)</label>
          <Input
            id="ownerEmail"
            name="ownerEmail"
            placeholder="ej: owner@restaurante.com"
            defaultValue={state.values?.ownerEmail ?? ""}
            autoComplete="off"
          />
          {state.fieldErrors?.ownerEmail ? <p className="text-sm text-red-600">{state.fieldErrors.ownerEmail}</p> : null}
          <p className="text-xs text-muted-foreground">
            si el usuario existe, se asigna. si no existe, se crea el proyecto sin owner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SubmitButton />
          <a href="/dashboard/admin/restaurants" className="text-sm text-muted-foreground hover:text-foreground">
            cancelar
          </a>
        </div>
      </form>
    </Card>
  );
}
