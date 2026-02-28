import { cn } from "@/lib/ui/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border bg-white px-3 text-sm shadow-[var(--shadow-sm)] " +
          "placeholder:text-[rgb(var(--muted-fg))] " +
          "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}
