import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

type BadgeVariant = "default" | "nuevo" | "oferta" | "agotado"

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  nuevo: "bg-blue-50 text-blue-700 border-blue-200",
  oferta: "bg-red-50 text-red-700 border-red-200",
  agotado: "bg-gray-100 text-gray-500 border-gray-200",
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
