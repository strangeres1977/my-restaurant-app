import { cn } from "@/lib/ui/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-xs text-[rgb(var(--muted-fg))] shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    />
  );
}
