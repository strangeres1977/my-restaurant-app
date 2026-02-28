"use client";

import { useMemo, useState } from "react";

type Props = {
  role: "SUPER_ADMIN" | "PROJECT_OWNER" | "RESTAURANT_OWNER";
  restaurant: {
    slug: string;
    name: string;
    description: string | null;
    themeColor: string | null;
    bannerUrl: string | null;
    logoUrl: string | null;
    contactEmail: string | null;
  };
};

type UiState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 16,
  padding: 16,
};

async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error || "error subiendo imagen");
  return data.url as string;
}

export default function WebSettingsForm({ role, restaurant }: Props) {
  const [bannerUrl, setBannerUrl] = useState(restaurant.bannerUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl ?? "");
  const [themeColor, setThemeColor] = useState(restaurant.themeColor ?? "");
  const [contactEmail, setContactEmail] = useState(restaurant.contactEmail ?? "");
  const [description, setDescription] = useState(restaurant.description ?? "");

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [state, setState] = useState<UiState>({ status: "idle" });

  const saving = state.status === "saving";

  const canSave = useMemo(() => {
    if (saving) return false;
    if (themeColor && !/^#([0-9a-fA-F]{6})$/.test(themeColor)) return false;
    return true;
  }, [saving, themeColor]);

  const publicUrl = `/${restaurant.slug}`;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setState({ status: "saving" });

    const payload: any = {
      bannerUrl: bannerUrl.trim() || null,
      logoUrl: logoUrl.trim() || null,
      themeColor: themeColor.trim() || null,
      contactEmail: contactEmail.trim() || null,
      description: description.trim() || null,
    };

    if (role === "SUPER_ADMIN") payload.restaurantSlug = restaurant.slug;

    try {
      const res = await fetch("/api/restaurant/public-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState({ status: "error", message: data?.error || "no se pudo guardar" });
        return;
      }

      setState({ status: "success", message: "guardado. abriendo preview..." });

      // abre la web pública en otra pestaña con un cache-buster para ver cambios al momento
      const cb = Date.now();
      window.open(`${publicUrl}?v=${cb}`, "_blank", "noreferrer");
    } catch {
      setState({ status: "error", message: "error de red" });
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ ...cardStyle, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          restaurante: {restaurant.name} ({restaurant.slug})
        </div>
        <span style={{ flex: 1 }} />
        <a
          href={`${publicUrl}?v=${Date.now()}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
          }}
        >
          abrir preview
        </a>
        <a
          href={`/${restaurant.slug}/contacto?v=${Date.now()}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
          }}
        >
          ver contacto
        </a>
      </div>

      <form onSubmit={onSave} style={{ ...cardStyle, display: "grid", gap: 14 }}>
        <label style={labelStyle}>
          <span>banner url</span>
          <input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            style={inputStyle}
            placeholder="https://... o /uploads/..."
            disabled={saving}
          />
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="preview banner"
              style={{
                width: "100%",
                maxHeight: 180,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
          ) : null}
        </label>

        <label style={labelStyle}>
          <span>subir banner (png/jpg/webp)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={saving || uploadingBanner}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                setUploadingBanner(true);
                const url = await uploadImage(file);
                setBannerUrl(url);
                setState({ status: "success", message: "banner subido, ahora guarda cambios" });
              } catch (err: any) {
                setState({ status: "error", message: err?.message || "error subiendo banner" });
              } finally {
                setUploadingBanner(false);
                e.target.value = "";
              }
            }}
          />
        </label>

        <label style={labelStyle}>
          <span>logo url</span>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            style={inputStyle}
            placeholder="https://... o /uploads/..."
            disabled={saving}
          />
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="preview logo"
              style={{
                width: 88,
                height: 88,
                objectFit: "cover",
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
          ) : null}
        </label>

        <label style={labelStyle}>
          <span>subir logo (png/jpg/webp)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={saving || uploadingLogo}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                setUploadingLogo(true);
                const url = await uploadImage(file);
                setLogoUrl(url);
                setState({ status: "success", message: "logo subido, ahora guarda cambios" });
              } catch (err: any) {
                setState({ status: "error", message: err?.message || "error subiendo logo" });
              } finally {
                setUploadingLogo(false);
                e.target.value = "";
              }
            }}
          />
        </label>

        <label style={labelStyle}>
          <span>color principal (themeColor)</span>
          <input
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            style={inputStyle}
            placeholder="#22c55e"
            disabled={saving}
          />
          {themeColor && !/^#([0-9a-fA-F]{6})$/.test(themeColor) ? (
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              formato inválido, tiene que ser tipo #22c55e
            </span>
          ) : null}
        </label>

        <label style={labelStyle}>
          <span>email de contacto</span>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            style={inputStyle}
            placeholder="contacto@..."
            disabled={saving}
          />
        </label>

        <label style={labelStyle}>
          <span>sobre nosotros (description)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
            disabled={saving}
            placeholder="cuenta quién eres, qué haces, especialidades, horarios..."
          />
        </label>

        <button
          type="submit"
          disabled={!canSave}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            cursor: canSave ? "pointer" : "not-allowed",
            opacity: canSave ? 1 : 0.6,
          }}
        >
          {saving ? "guardando..." : "guardar y abrir preview"}
        </button>

        {state.status === "success" ? (
          <div style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>
            {state.message}
          </div>
        ) : null}

        {state.status === "error" ? (
          <div style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>
            error: {state.message}
          </div>
        ) : null}
      </form>
    </section>
  );
}
