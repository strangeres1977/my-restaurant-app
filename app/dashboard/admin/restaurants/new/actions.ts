"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { redirect } from "next/navigation";

type ActionState = {
  ok: boolean;
  message?: string;
  warning?: string;
  fieldErrors?: Partial<Record<"name" | "slug" | "ownerEmail" | "landingTemplate", string>>;
  values?: {
    name?: string;
    slug?: string;
    ownerEmail?: string;
    landingTemplate?: "CATALOG" | "BRANDING" | "INFO";
    openingHours?: string;
  };
};

const schema = z.object({
  name: z.string().min(1, "el nombre es obligatorio").max(120, "demasiado largo"),
  slug: z.string().optional(),
  ownerEmail: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "email no válido"),
  landingTemplate: z.enum(["CATALOG", "BRANDING", "INFO"]).default("CATALOG"),
  openingHours: z.string().trim().max(500, "demasiado largo").optional(),
});

function uniqueSlugBase(base: string) {
  const s = slugify(base);
  return s.length ? s : "restaurant";
}

export async function createRestaurantAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim(),
    landingTemplate: String(formData.get("landingTemplate") ?? "").trim(),
    openingHours: String(formData.get("openingHours") ?? "").trim(),
  };

  const parsed = schema.safeParse({
    name: raw.name,
    slug: raw.slug || undefined,
    ownerEmail: raw.ownerEmail || undefined,
    landingTemplate: (raw.landingTemplate || "CATALOG") as any,
    openingHours: raw.openingHours || undefined,
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldErrors: ActionState["fieldErrors"] = {};
    if (flat.fieldErrors.name?.[0]) fieldErrors.name = flat.fieldErrors.name[0];
    if (flat.fieldErrors.slug?.[0]) fieldErrors.slug = flat.fieldErrors.slug[0];
    if (flat.fieldErrors.ownerEmail?.[0]) fieldErrors.ownerEmail = flat.fieldErrors.ownerEmail[0];
    if (flat.fieldErrors.landingTemplate?.[0]) fieldErrors.landingTemplate = flat.fieldErrors.landingTemplate[0];

    return {
      ok: false,
      message: "revisa el formulario",
      fieldErrors,
      values: {
        name: raw.name,
        slug: raw.slug,
        ownerEmail: raw.ownerEmail,
        landingTemplate: (raw.landingTemplate as any) || "CATALOG",
        openingHours: raw.openingHours,
      },
    };
  }

  const { name, slug, ownerEmail, landingTemplate, openingHours } = parsed.data;

  const baseSlug = uniqueSlugBase(slug ?? name);
  const finalSlug = baseSlug;

  const existing = await prisma.restaurant.findUnique({ where: { slug: finalSlug }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      message: "ese slug ya existe",
      fieldErrors: { slug: "ese slug ya existe, pon otro" },
      values: { name, slug: finalSlug, ownerEmail: ownerEmail ?? "", landingTemplate, openingHours: openingHours ?? "" },
    };
  }

  let userId: string | null = null;
  let warning: string | undefined;

  if (ownerEmail) {
    const user = await prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } });
    if (user) {
      userId = user.id;
    } else {
      warning = "no existe un usuario con ese email; el proyecto se crea sin owner";
    }
  }

  await prisma.restaurant.create({
    data: {
      name,
      slug: finalSlug,
      userId,
      landingTemplate,
      openingHours: openingHours || null,
    },
    select: { id: true },
  });

  redirect("/dashboard/admin/restaurants?created=1");
}
