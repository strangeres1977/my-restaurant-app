"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sort: number;
};

type FormState = {
  id?: string;
  name: string;
  price: string;
  description: string;
  category: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sort: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    price: "",
    description: "",
    category: "",
    imageUrl: "",
    isFeatured: false,
    isActive: true,
    sort: "0",
  };
}

function money(v: number) {
  try {
    return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  } catch {
    return `${v} €`;
  }
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "error subiendo imagen");

  const url = String(data?.url || "").trim();
  if (!url) throw new Error("upload sin url");
  return url;
}

const LS_KEY = "pp_selected_restaurant_slug";

function extractRole(me: any): string {
  // soporta varias formas típicas de /api/auth/me
  const candidates = [
    me?.role,
    me?.user?.role,
    me?.data?.role,
    me?.data?.user?.role,
    me?.session?.role,
    me?.payload?.role,
  ];

  for (const c of candidates) {
    const s = String(c || "").trim();
    if (s) return s;
  }
  return "";
}

function extractRestaurantSlug(me: any): string {
  const candidates = [
    me?.restaurantSlug,
    me?.user?.restaurantSlug,
    me?.data?.restaurantSlug,
    me?.data?.user?.restaurantSlug,
    me?.payload?.restaurantSlug,
  ];
  for (const c of candidates) {
    const s = String(c || "").trim();
    if (s) return s;
  }
  return "";
}

export default function ProductsClient() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");

  function setSlugAndPersist(slug: string) {
    const v = String(slug || "").trim();
    setSelectedSlug(v);
    setSlugInput(v);
    try {
      if (v) localStorage.setItem(LS_KEY, v);
      else localStorage.removeItem(LS_KEY);
    } catch {}
  }

  function withSlug(path: string, slugOverride?: string) {
    const slug = String(slugOverride ?? selectedSlug ?? "").trim();
    if (!slug) return path;
    const u = new URL(path, window.location.origin);
    u.searchParams.set("restaurantSlug", slug);
    return u.pathname + u.search;
  }

  async function load(slugOverride?: string) {
    setLoading(true);
    setError(null);

    try {
      const sa = isSuperAdmin === true;
      const slug = String(slugOverride ?? selectedSlug ?? "").trim();

      // superadmin: si no hay slug, no cargamos (evitamos fallback)
      if (sa && !slug) {
        setDishes([]);
        setLoading(false);
        return;
      }

      const url =
        typeof window === "undefined"
          ? "/api/dishes"
          : sa
            ? withSlug("/api/dishes", slug)
            : "/api/dishes";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "error cargando productos");

      setDishes(Array.isArray(data?.dishes) ? data.dishes : []);
    } catch (e: any) {
      setError(e?.message || "error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  // boot:
  // - detecta rol por /api/auth/me
  // - owner: carga directo sin selector
  // - superadmin: muestra selector siempre, intenta precargar slug (query/localStorage)
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const me = await res.json().catch(() => null);

        if (cancelled) return;

        const role = extractRole(me).toUpperCase();
        const sa = role === "SUPER_ADMIN";
        setIsSuperAdmin(sa);

        // 1) si viene slug por query: ?slug=xxx o ?restaurantSlug=xxx
        try {
          const url = new URL(window.location.href);
          const q =
            (url.searchParams.get("slug") || "").trim() ||
            (url.searchParams.get("restaurantSlug") || "").trim();

          if (q) {
            setSlugAndPersist(q);
            if (sa) {
              await load(q);
              return;
            }
          }
        } catch {}

        if (sa) {
          // 2) si hay slug guardado en localStorage
          try {
            const saved = (localStorage.getItem(LS_KEY) || "").trim();
            if (saved) {
              setSlugAndPersist(saved);
              await load(saved);
              return;
            }
          } catch {}

          // superadmin sin slug: no cargamos nada, dejamos listo para elegir
          setDishes([]);
          setLoading(false);
          return;
        }

        // owner/otros: si el token trae restaurantSlug, lo usamos solo para pintar info (no para llamar)
        const rs = extractRestaurantSlug(me);
        if (rs) {
          setSelectedSlug("");
          setSlugInput("");
        }

        await load();
      } catch (e: any) {
        if (cancelled) return;

        // fallback: si falla /api/auth/me, no bloqueamos
        // asumimos "no superadmin" para no mostrar selector a owners.
        setIsSuperAdmin(false);
        await load();
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes
      .filter((d) => (onlyActive ? d.isActive : true))
      .filter((d) => {
        if (!q) return true;
        return (
          d.name.toLowerCase().includes(q) ||
          (d.category || "").toLowerCase().includes(q) ||
          (d.description || "").toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.sort !== b.sort) return a.sort - b.sort;
        return 0;
      });
  }, [dishes, query, onlyActive]);

  function openCreate() {
    setForm(emptyForm());
    setOpenForm(true);
  }

  function openEdit(d: Dish) {
    setForm({
      id: d.id,
      name: d.name,
      price: String(d.price),
      description: d.description || "",
      category: d.category || "",
      imageUrl: d.imageUrl || "",
      isFeatured: Boolean(d.isFeatured),
      isActive: Boolean(d.isActive),
      sort: String(d.sort ?? 0),
    });
    setOpenForm(true);
  }

  function assertReadyToMutate() {
    if (isSuperAdmin === true && !selectedSlug.trim()) {
      throw new Error("selecciona un proyecto (slug) para gestionar productos");
    }
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      assertReadyToMutate();

      const payload: any = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim() ? form.description : null,
        category: form.category.trim() ? form.category : null,
        imageUrl: form.imageUrl.trim() ? form.imageUrl : null,
        isFeatured: Boolean(form.isFeatured),
        isActive: Boolean(form.isActive),
        sort: Number(form.sort),
      };

      if (!payload.name) throw new Error("name requerido");
      if (!Number.isFinite(payload.price) || payload.price < 0) throw new Error("price inválido");
      if (!Number.isFinite(payload.sort) || payload.sort < 0) throw new Error("sort inválido");

      const isEdit = Boolean(form.id);
      const base = isEdit ? `/api/dishes/${form.id}` : `/api/dishes`;
      const url =
        typeof window === "undefined"
          ? base
          : isSuperAdmin === true
            ? withSlug(base)
            : base;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "error guardando");

      setOpenForm(false);
      await load();
    } catch (e: any) {
      setError(e?.message || "error guardando");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("borrar producto?")) return;
    setError(null);

    try {
      assertReadyToMutate();

      const base = `/api/dishes/${id}`;
      const url =
        typeof window === "undefined"
          ? base
          : isSuperAdmin === true
            ? withSlug(base)
            : base;

      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "error borrando");
      await load();
    } catch (e: any) {
      setError(e?.message || "error borrando");
    }
  }

  async function quickToggle(id: string, patch: any) {
    setError(null);

    try {
      assertReadyToMutate();

      const base = `/api/dishes/${id}`;
      const url =
        typeof window === "undefined"
          ? base
          : isSuperAdmin === true
            ? withSlug(base)
            : base;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "error actualizando");
      await load();
    } catch (e: any) {
      setError(e?.message || "error actualizando");
    }
  }

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      setError(err?.message || "error subiendo imagen");
    } finally {
      setUploading(false);
    }
  }

  const showSelector = isSuperAdmin === true;

  return (
    <div className="rounded-3xl border border bg-[rgb(var(--card))] p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--muted))] hover:bg-[rgb(var(--card))]"
            >
              nuevo
            </button>

            <button
              type="button"
              onClick={() => load()}
              className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))]"
            >
              recargar
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex items-center gap-2 text-sm text-[rgb(var(--fg))]/80">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              solo activos
            </label>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="buscar por nombre, categoría o descripción"
              className="w-full md:w-80 rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
            />
          </div>
        </div>

        {showSelector ? (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="text-xs text-[rgb(var(--fg))]/60">
              superadmin: selecciona el proyecto por slug
            </div>

            <div className="flex gap-2">
              <input
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="slug del proyecto (ej: demo-restaurant)"
                className="w-full md:w-72 rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
              />

              <button
                type="button"
                onClick={() => {
                  const v = slugInput.trim();
                  setSlugAndPersist(v);
                  load(v);
                }}
                className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))]"
              >
                cargar
              </button>

              {selectedSlug ? (
                <button
                  type="button"
                  onClick={() => {
                    setSlugAndPersist("");
                    load("");
                  }}
                  className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))]"
                >
                  limpiar
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      {showSelector && !selectedSlug ? (
        <div className="mt-5 rounded-2xl border border bg-[rgb(var(--bg))] p-4 text-sm text-[rgb(var(--fg))]/70">
          elige un proyecto (slug) arriba para ver y gestionar sus productos.
        </div>
      ) : (
        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-[rgb(var(--fg))]/70">cargando...</div>
          ) : filtered.length ? (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((d) => (
                <div key={d.id} className="rounded-2xl border border bg-[rgb(var(--bg))] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate">{d.name}</div>

                        {d.isFeatured ? (
                          <span className="text-xs rounded-xl border border px-2 py-0.5 text-[rgb(var(--fg))]/70">
                            destacado
                          </span>
                        ) : null}

                        {!d.isActive ? (
                          <span className="text-xs rounded-xl border border px-2 py-0.5 text-[rgb(var(--fg))]/50">
                            inactivo
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-sm text-[rgb(var(--fg))]/70">
                        {d.category ? `${d.category} · ` : ""}
                        {money(d.price)} · sort {d.sort}
                      </div>

                      {d.description ? (
                        <div className="mt-1 text-sm text-[rgb(var(--fg))]/60">{d.description}</div>
                      ) : null}

                      {d.imageUrl ? (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={d.imageUrl}
                            alt={d.name}
                            className="h-12 w-12 rounded-xl object-cover border border"
                          />
                          <div className="text-xs text-[rgb(var(--fg))]/50 break-all">{d.imageUrl}</div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => quickToggle(d.id, { isActive: !d.isActive })}
                        className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] text-sm"
                      >
                        {d.isActive ? "desactivar" : "activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => quickToggle(d.id, { isFeatured: !d.isFeatured })}
                        className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] text-sm"
                      >
                        {d.isFeatured ? "quitar destacado" : "destacar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(d)}
                        className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] text-sm"
                      >
                        editar
                      </button>

                      <button
                        type="button"
                        onClick={() => del(d.id)}
                        className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] text-sm"
                      >
                        borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[rgb(var(--fg))]/70">no hay productos</div>
          )}
        </div>
      )}

      {openForm ? (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-full p-4 grid place-items-center">
            <div className="w-full max-w-xl rounded-3xl border border bg-[rgb(var(--card))]">
              <div className="p-5 border-b border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg">{form.id ? "editar producto" : "nuevo producto"}</div>
                    <div className="mt-1 text-sm text-[rgb(var(--fg))]/70">
                      al guardar, se revalida /[slug] y /[slug]/productos.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenForm(false)}
                    className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))] text-sm"
                  >
                    cerrar
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-sm">
                    nombre
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm">
                      precio
                      <input
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                        placeholder="ej: 9.90"
                      />
                    </label>

                    <label className="text-sm">
                      categoría
                      <input
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                        placeholder="ej: burgers"
                      />
                    </label>
                  </div>

                  <label className="text-sm">
                    descripción
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                      rows={3}
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-sm">imagen</div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={onPickFile}
                        className="text-sm"
                      />

                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                        className="rounded-2xl px-3 py-2 border border bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))] text-sm disabled:opacity-60"
                      >
                        quitar
                      </button>

                      {uploading ? (
                        <div className="text-sm text-[rgb(var(--fg))]/70">subiendo...</div>
                      ) : null}
                    </div>

                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2 text-sm"
                      placeholder="/uploads/... o https://..."
                    />

                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt="preview"
                        className="h-40 w-full rounded-2xl object-cover border border mt-2"
                      />
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      />
                      activo
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      />
                      destacado
                    </label>

                    <label className="text-sm">
                      sort
                      <input
                        value={form.sort}
                        onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 p-5 border-t border bg-[rgb(var(--card))] rounded-b-3xl">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={save}
                    className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] disabled:opacity-60"
                  >
                    {saving ? "guardando..." : "guardar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenForm(false)}
                    className="rounded-2xl px-4 py-2 border border bg-[rgb(var(--bg))] hover:bg-[rgb(var(--muted))]"
                  >
                    cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
