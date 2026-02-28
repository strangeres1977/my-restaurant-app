export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-2xl">no existe ese restaurante</div>
        <div className="mt-2 text-[rgb(var(--fg))]/70">revisa el slug en la url</div>
      </div>
    </div>
  );
}
