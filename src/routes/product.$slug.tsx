import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, MessageCircle, Minus, Phone, Plus, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductCard";
import { discount, formatKsh, orderMessage, PHONE_DISPLAY, productQuery, productsQuery, TEL_LINK, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product details — TCL Kenya" },
      { name: "description", content: "Product details, specs and price. Order by call or WhatsApp from TCL Kenya." },
      { property: "og:title", content: "Product details — TCL Kenya" },
      { property: "og:description", content: "Order this TCL product by call or WhatsApp." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useQuery(productQuery(slug));
  const { data: all = [] } = useQuery(productsQuery());
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState<string | null>(null);

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-20"><div className="aspect-[2/1] animate-pulse rounded-3xl bg-muted" /></div>;
  if (!p)
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link to="/products" search={{}} className="mt-4 inline-block text-primary">Back to products</Link>
      </div>
    );

  const images = [p.image_url, ...p.gallery].filter(Boolean) as string[];
  const main = active ?? images[0];
  const off = discount(p);
  const specs = Object.entries((p.specs ?? {}) as Record<string, string>);
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/products" search={{ category: p.category }} className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> {p.category}
      </Link>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-card">
            {main && <img src={main} alt={p.name} width={1024} height={1024} className="aspect-square w-full object-cover" />}
            {off > 0 && <span className="absolute left-5 top-5 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">Save {off}%</span>}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img) => (
                <button key={img} onClick={() => setActive(img)}
                  className={`h-20 w-20 overflow-hidden rounded-2xl border-2 ${main === img ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{p.category}</span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">{p.name}</h1>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{formatKsh(Number(p.price))}</span>
            {p.old_price && off > 0 && <span className="text-lg text-muted-foreground line-through">{formatKsh(Number(p.old_price))}</span>}
          </div>
          <p className={`mt-2 text-sm font-semibold ${p.in_stock ? "text-whatsapp" : "text-destructive"}`}>
            {p.in_stock ? "● In stock — ready for delivery" : "● Currently out of stock"}
          </p>
          {p.description && <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{p.description}</p>}
          {p.features.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="rounded-2xl bg-surface px-4 py-3 text-sm font-medium shadow-card">{f}</li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity</span>
            <div className="flex items-center rounded-full border border-border bg-surface">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="p-3" onClick={() => setQty(qty + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button variant="whatsapp" size="xl" asChild>
              <a href={whatsappLink(orderMessage(p, qty))} target="_blank" rel="noreferrer"><MessageCircle /> Order via WhatsApp</a>
            </Button>
            <Button variant="buy" size="xl" asChild>
              <a href={TEL_LINK}><Phone /> Call to Order</a>
            </Button>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground sm:text-left">Or call us directly on <a href={TEL_LINK} className="font-semibold text-foreground">{PHONE_DISPLAY}</a></p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-2xl border border-border p-4"><Truck className="h-5 w-5 text-primary" /> Fast delivery</div>
            <div className="flex items-center gap-2 rounded-2xl border border-border p-4"><ShieldCheck className="h-5 w-5 text-primary" /> Official warranty</div>
          </div>

          {specs.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold">Specifications</h2>
              <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 px-5 py-3 text-sm">
                    <dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-bold">You may also like</h2>
          <ProductGrid items={related} />
        </section>
      )}
    </div>
  );
}
