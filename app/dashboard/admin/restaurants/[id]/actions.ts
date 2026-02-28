"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { redirect } from "next/navigation";

type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<
    "name" | "slug" | "description" | "themeColor" | "bannerUrl" | "logoUrl" | "contactEmail",
    string
  >>;
  values?: Record<string, string>;
};

const hexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "el nombre es obligatorio").max(120, "demasiado largo"),
  slug: z.string().optional(),
  description: z.string().optional(),
  themeColor: z.string().optional(),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  contactEmail: z.string().optional(),
});

function isAllowedImageUrl(v: string) {
  if (!v) return true;
  const u = v.trim();
  if (/^https?:\/\//i.test(u)) return true;
  if (u.startsWith("/uploads/")) return true;
  return false;
}

export async function updateRestaurantAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    id: String(formData.get("id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    themeColor: String(formData.get("themeColor") ?? "").trim(),
    bannerUrl: String(formData.get("bannerUrl") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
  };

  const parsed = schema.safeParse({
    id: raw.id,
    name: raw.name,
    slug: raw.slug || undefined,
    description: raw.description || undefined,
    themeColor: raw.themeColor || undefined,
    bannerUrl: raw.bannerUrl || undefined,
    logoUrl: raw.logoUrl || undefined,
    contactEmail: raw.contactEmail || undefined,
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: ActionState["fieldErrors"] = {};
    if (flat.name?.[0]) fieldErrors.name = flat.name[0];
    if (flat.slug?.[0]) fieldErrors.slug = flat.slug[0];
    if (flat.description?.[0]) fieldErrors.description = flat.description[0];
    if (flat.themeColor?.[0]) fieldErrors.themeColor = flat.themeColor[0];
    if (flat.bannerUrl?.[0]) fieldErrors.bannerUrl = flat.bannerUrl[0];
    if (flat.logoUrl?.[0]) fieldErrors.logoUrl = flat.logoUrl[0];
    if (flat.contactEmail?.[0]) fieldErrors.contactEmail = flat.contactEmail[0];

    return { ok: false, message: "revisa el formulario", fieldErrors, values: raw };
  }

  const { id, name } = parsed.data;

  const desiredSlug = slugify(parsed.data.slug ?? name) || "restaurant";

  const existing = await prisma.restaurant.findFirst({
    where: { slug: desiredSlug, NOT: { id } },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      message: "ese slug ya existe",
      fieldErrors: { slug: "ese slug ya existe, pon otro" },
      values: { ...raw, slug: desiredSlug },
    };
  }

  const fieldErrors: ActionState["fieldErrors"] = {};

  const themeColor = parsed.data.themeColor?.trim();
  if (themeColor && !hexColor.test(themeColor)) {
    fieldErrors.themeColor = "color inválido, usa formato #22c55e";
  }

  const bannerUrl = parsed.data.bannerUrl?.trim();
  if (bannerUrl && !isAllowedImageUrl(bannerUrl)) {
    fieldErrors.bannerUrl = "url inválida (usa https://... o /uploads/...)";
  }

  const logoUrl = parsed.data.logoUrl?.trim();
  if (logoUrl && !isAllowedImageUrl(logoUrl)) {
    fieldErrors.logoUrl = "url inválida (usa https://... o /uploads/...)";
  }

  const contactEmail = parsed.data.contactEmail?.trim();
  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    fieldErrors.contactEmail = "email no válido";
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: "revisa el formulario",
      fieldErrors,
      values: { ...raw, slug: desiredSlug },
    };
  }

  await prisma.restaurant.update({
    where: { id },
    data: {
      name,
      slug: desiredSlug,
      description: parsed.data.description ?? null,
      themeColor: themeColor ?? null,
      bannerUrl: bannerUrl ?? null,
      logoUrl: logoUrl ?? null,
      contactEmail: contactEmail ?? null,
    },
  });

  redirect("/dashboard/admin/restaurants?updated=1");
}
