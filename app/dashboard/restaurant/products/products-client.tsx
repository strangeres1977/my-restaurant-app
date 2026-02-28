"use client";

import { useEffect, useMemo, useState } from "react";

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
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  id?: string;
  name: string;
  price: string; // input text
  description: string;
  category: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sort: string; // input text
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

export default function ProductsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/dishes", window.location.origin);
      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "error cargando productos");
      setDishes(data.dishes || []);
    } catch (e: any) {
      setError(e?.message || "error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
        // featured primero, luego sort asc, luego created desc si existe
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

  async function save() {
    setSaving(true);
    setError(null);
    try {
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
      const url = isEdit ? `/api/dishes/${form.id}` : `/api/dishes`;
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
      const res = await fetch(`/api/dishes/${id}`, { method: "DELETE", credentials: "include" });
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
      const res = await fetch(`/api/dishes/${id}`, {
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

  return (
    <div className="rounded-3xl border border bg-[rgb(var(--card))] p-4 md:p-6">
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
            onClick={load}
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

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

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
                      <div className="mt-2 text-xs text-[rgb(var(--fg))]/50 break-all">{d.imageUrl}</div>
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

      {openForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border bg-[rgb(var(--card))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg">{form.id ? "editar producto" : "nuevo producto"}</div>
                <div className="mt-1 text-sm text-[rgb(var(--fg))]/70">
                  guarda y se revalida /[slug] y /[slug]/productos automáticamente.
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

            <div className="mt-4 grid grid-cols-1 gap-3">
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

              <label className="text-sm">
                imageUrl (por ahora manual; luego lo conectamos al uploader)
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border bg-[rgb(var(--bg))] px-4 py-2"
                  placeholder="/uploads/... o https://..."
                />
              </label>

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

              <div className="mt-2 flex flex-wrap gap-2">
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
      ) : null}
    </div>
  );
}
