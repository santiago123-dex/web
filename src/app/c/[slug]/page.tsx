import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Store, Search, Globe, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { QRCode } from "@/components/catalogo/qr-code"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: catalogo } = await supabase
    .from("catalogos")
    .select("*, profile:user_id(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .single()

  if (!catalogo) return { title: "Catálogo no encontrado | Vitrina" }

  return {
    title: `${catalogo.nombre} | ${catalogo.profile?.nombre_negocio ?? "Vitrina"}`,
    description: catalogo.descripcion ?? "Mirá nuestro catálogo",
    openGraph: {
      title: catalogo.nombre,
      description: catalogo.descripcion ?? undefined,
    },
  }
}

export default async function PublicCatalogoPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: catalogo } = await supabase
    .from("catalogos")
    .select("*, profile:user_id(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .single()

  if (!catalogo) notFound()

  const { q } = await searchParams

  const profile = catalogo.profile as {
    nombre_negocio: string
    descripcion: string | null
    logo_url: string | null
    cover_url: string | null
    whatsapp: string | null
    instagram: string | null
    website: string | null
    horarios: string | null
    color_primario: string
    color_secundario: string
  } | null

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("catalogo_id", catalogo.id)
    .order("orden", { ascending: true })

  let { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("catalogo_id", catalogo.id)
    .eq("disponible", true)
    .order("destacado", { ascending: false })
    .order("orden", { ascending: true })

  if (q && productos) {
    const query = q.toLowerCase()
    productos = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion?.toLowerCase().includes(query) ?? false),
    )
  }

  const destacados = productos?.filter((p) => p.destacado) ?? []
  const regulares = productos?.filter((p) => !p.destacado) ?? []

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/c/${slug}`

  const primary = profile?.color_primario ?? "#8b5cf6"
  const secondary = profile?.color_secundario ?? "#f0f0ff"

  // Track visit
  if (catalogo.id) {
    await supabase.from("visitas").insert({ catalogo_id: catalogo.id })
    await supabase
      .from("catalogos")
      .update({ visitas: (catalogo.visitas ?? 0) + 1 })
      .eq("id", catalogo.id)
  }

  const grouped = regulares.reduce<Record<string, any[]>>(
    (acc, p) => {
      const key = (p as any).categoria_id ?? "sin-categoria"
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    },
    {},
  )

  const getCategoriaName = (id: string) => {
    if (id === "sin-categoria") return "Productos"
    const cat = categorias?.find((c) => c.id === id)
    return cat ? `${cat.icono} ${cat.nombre}` : "Productos"
  }

  const whatsappLink = (
    producto?: { nombre: string; precio: number },
  ): string | undefined => {
    if (!profile?.whatsapp) return undefined
    let msg = `Hola! Vi esto en tu catálogo de ${catalogo.nombre}`
    if (producto) {
      msg = `Hola! Me interesa "${producto.nombre}" ($${producto.precio.toFixed(2)}) que vi en tu catálogo de ${catalogo.nombre}`
    }
    return `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(msg)}`
  }

  const generalWaLink = whatsappLink()

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: secondary, color: "#171717" }}
    >
      <style>{`
        .btn-primary {
          background-color: ${primary};
          color: white;
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .text-primary-custom {
          color: ${primary};
        }
        .border-primary-custom {
          border-color: ${primary}33;
        }
        .ring-primary-custom {
          box-shadow: 0 0 0 2px ${primary}22;
        }
        .bg-primary-light {
          background-color: ${primary}11;
        }
      `}</style>

      {/* HEADER — Cover / Hero */}
      <header
        className="relative"
        style={
          profile?.cover_url
            ? {
                backgroundImage: `url(${profile.cover_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { backgroundColor: primary }
        }
      >
        <div
          className={`${profile?.cover_url ? "bg-gradient-to-b from-black/60 via-black/40 to-black/60" : ""}`}
        >
          <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.nombre_negocio}
                className="size-20 rounded-full object-cover mb-4 border-2 border-white/30"
              />
            ) : (
              <div className="size-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Store className="size-8 text-white" />
              </div>
            )}
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              {profile?.nombre_negocio ?? catalogo.nombre}
            </h1>
            {catalogo.descripcion && (
              <p className="text-sm text-white/80 max-w-sm">
                {catalogo.descripcion}
              </p>
            )}
            <p
              className="text-xs text-white/60 mt-2 inline-flex items-center gap-1"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              <Store className="size-3" /> {catalogo.nombre}
            </p>
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS BAR */}
      <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {generalWaLink && (
            <a
              href={generalWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar
            </a>
          )}
          {profile?.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap hover:bg-muted transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
            </a>
          )}
          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap hover:bg-muted transition-colors"
            >
              <Globe className="size-4" />
              Web
            </a>
          )}
          {profile?.horarios && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-4 py-2 whitespace-nowrap">
              <Clock className="size-4" />
              {profile.horarios}
            </span>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <form className="max-w-lg mx-auto px-4 pt-4" method="GET">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscá productos..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{ "--tw-ring-color": primary } as React.CSSProperties}
          />
        </div>
      </form>

      <main className="max-w-lg mx-auto px-4 pb-24">
        {/* DESTACADOS */}
        {destacados.length > 0 && (
          <section className="pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Destacados
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {destacados.map((p) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  whatsappLink={whatsappLink(p)}
                  primary={primary}
                />
              ))}
            </div>
          </section>
        )}

        {/* CATEGORÍAS */}
        {Object.entries(grouped).map(([categoriaId, items]) => (
          <section key={categoriaId} className="pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
              {getCategoriaName(categoriaId)}
              <span className="text-xs text-muted-foreground/60">
                ({items.length})
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  whatsappLink={whatsappLink(p)}
                  primary={primary}
                  layout="list"
                />
              ))}
            </div>
          </section>
        ))}

        {/* Sin productos */}
        {(!productos || productos.length === 0) && (
          <div className="text-center py-24 text-muted-foreground">
            <Store className="size-12 mx-auto mb-3 opacity-30" />
            <p>No hay productos disponibles</p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>Hecho con Vitrina — {profile?.nombre_negocio ?? catalogo.nombre}</p>
        </footer>
      </main>

      {/* FLOATING QR BUTTON */}
      <details className="fixed bottom-6 right-6 z-30 group">
        <summary className="btn-primary size-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer list-none">
          <Store className="size-5" />
        </summary>
        <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-xl border p-4 w-48">
          <p className="text-xs font-medium text-center mb-3 text-muted-foreground">
                Escaneá para ver el catálogo
              </p>
          <QRCode url={url} size={160} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-center block mt-2 underline text-primary-custom"
          >
            {url.replace("https://", "")}
          </a>
        </div>
      </details>
    </div>
  )
}

function ProductCard({
  producto,
  whatsappLink,
  primary,
  layout = "grid",
}: {
  producto: {
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    imagen_url: string | null
    badge: string | null
  }
  whatsappLink: string | undefined
  primary: string
  layout?: "grid" | "list"
}) {
  if (layout === "grid") {
    return (
      <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square bg-muted relative">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-muted-foreground/30">
              <Store className="size-8" />
            </div>
          )}
          {producto.badge && (
            <div className="absolute top-2 left-2">
              <Badge
                variant={
                  producto.badge as "nuevo" | "oferta" | "agotado"
                }
              >
                {producto.badge === "nuevo"
                  ? "Nuevo"
                  : producto.badge === "oferta"
                    ? "Oferta"
                    : "Agotado"}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {producto.descripcion}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="font-semibold text-sm">
              ${producto.precio.toFixed(2)}
            </span>
            {whatsappLink && producto.badge !== "agotado" && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow flex">
      {producto.imagen_url && (
        <div className="size-24 shrink-0 bg-muted">
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">
              {producto.nombre}
            </h3>
            {producto.badge && (
              <Badge
                variant={
                  producto.badge as "nuevo" | "oferta" | "agotado"
                }
              >
                {producto.badge === "nuevo"
                  ? "Nuevo"
                  : producto.badge === "oferta"
                    ? "Oferta"
                    : "Agotado"}
              </Badge>
            )}
          </div>
          {producto.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {producto.descripcion}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold">
            ${producto.precio.toFixed(2)}
          </span>
          {whatsappLink && producto.badge !== "agotado" && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-3"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
