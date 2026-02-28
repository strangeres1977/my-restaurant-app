"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] flex items-center justify-center p-8">
      <div className="max-w-md">
        <div className="text-2xl">ha petao algo 😅</div>
        <div className="mt-2 text-[rgb(var(--fg))]/70 break-words">{error?.message}</div>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10"
        >
          reintentar
        </button>
      </div>
    </div>
  );
}
