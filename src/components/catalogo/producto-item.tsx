import type { Producto } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export function ProductoItem({ producto }: { producto: Producto }) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        {producto.imagen_url && (
          <div className="size-20 rounded-lg overflow-hidden shrink-0 bg-muted">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="size-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {producto.descripcion}
            </p>
          )}
          <p className="text-sm font-semibold mt-1">
            ${producto.precio.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
