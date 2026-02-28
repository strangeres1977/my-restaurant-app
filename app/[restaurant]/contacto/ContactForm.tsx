"use client";

import { useMemo, useState } from "react";

type Props = {
  restaurantSlug: string;
};

type UiState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success"; message: string }
  | { status: "rate_limited"; message: string }
  | { status: "error"; message: string };

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical",
};

function alertStyle(kind: "success" | "warning" | "error"): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
  };
  if (kind === "success") return base;
  if (kind === "warning") return base;
  return base;
}

export default function ContactForm({ restaurantSlug }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<UiState>({ status: "idle" });

  const isSending = state.status === "sending";

  const canSubmit = useMemo(() => {
    const okEmail = email.trim().includes("@");
    return (
      !isSending &&
      name.trim().length >= 2 &&
      okEmail &&
      message.trim().length >= 10
    );
  }, [name, email, message, isSending]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState({ status: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const raw = await res.text();
      const data = safeJsonParse<any>(raw);

      if (res.status === 429) {
        setState({
          status: "rate_limited",
          message:
            data?.message ||
            "vas mu rápido, espera un poco y vuelve a intentarlo.",
        });
        return;
      }

      if (!res.ok) {
        setState({
          status: "error",
          message:
            data?.message ||
            "no se pudo enviar el mensaje. prueba otra vez en un momento.",
        });
        return;
      }

      setState({
        status: "success",
        message: data?.message || "mensaje enviado. gracias!",
      });

      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setState({
        status: "error",
        message:
          "fallo de red o servidor. revisa tu conexión y prueba otra vez.",
      });
    }
  }

  return (
    <section>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={isSending}
            placeholder="tu nombre"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isSending}
            placeholder="tu@email.com"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>mensaje</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            placeholder="cuéntanos en qué te ayudamos..."
            style={textareaStyle}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          {isSending ? "enviando..." : "enviar"}
        </button>

        {state.status === "success" && (
          <div style={alertStyle("success")}>{state.message}</div>
        )}

        {state.status === "rate_limited" && (
          <div style={alertStyle("warning")}>{state.message}</div>
        )}

        {state.status === "error" && (
          <div style={alertStyle("error")}>{state.message}</div>
        )}
      </form>

      <p style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
        restaurante: {restaurantSlug}
      </p>
    </section>
  );
}
