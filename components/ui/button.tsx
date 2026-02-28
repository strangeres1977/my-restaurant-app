import { cn } from "@/lib/ui/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl border text-sm font-medium transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--ring))] " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] border-transparent hover:opacity-95 shadow-[var(--shadow-sm)]",
    secondary:
      "bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-fg))] border-[rgb(var(--border))] hover:opacity-95",
    ghost:
      "bg-transparent text-[rgb(var(--fg))] border-transparent hover:bg-[rgb(var(--accent))]",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3",
    md: "h-10 px-4",
    lg: "h-11 px-5 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

