import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle, Phone, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";
import heroTv from "@/assets/hero-tv.jpg";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductCard";
import { CATEGORIES, productsQuery, TEL_LINK, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TCL Kenya — Official TVs, Soundbars & Appliances" },
      { name: "description", content: "QLED & Mini-LED TVs, Dolby Atmos soundbars, fridges and washers. Buy now, call or order on WhatsApp." },
      { property: "og:title", content: "TCL Kenya — Official TVs, Soundbars & Appliances" },
      { property: "og:description", content: "Buy TCL TVs and appliances in Kenya. Order by phone or WhatsApp." },
    ],
  }),
  component: Index,
});

const catImages: Record<string, string> = {
  TVs: "/products/tv-p7l.jpg",
  Soundbars: "/products/soundbar.jpg",
  Refrigerators: "/products/fridge.jpg",
  "Washing Machines": "/products/washer.jpg",
};

function Index() {
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const featured = products.filter((p) => p.featured);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img src={heroTv} alt="TCL QLED TV in a dark living room" width={1920} height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-center px-4 py-24">
          <span className="mb-6 inline-flex w-fit animate-rise items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-primary" /> New · P755 4K UHD
          </span>
          <h1 className="max-w-2xl animate-rise text-5xl font-extrabold leading-[1.02] md:text-7xl">
            Powerful mind. <span className="text-gradient-brand">Sleek uni-body.</span>
          </h1>
          <p className="mt-6 max-w-lg animate-rise text-lg text-ink-foreground/70 [animation-delay:120ms]">
            Dolby Vision & Atmos, Game Master and wide colour gamut — in 50", 55", 65" and 75".
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-rise [animation-delay:240ms]">
            <Button variant="buy" size="xl" asChild>
              <Link to="/products" search={{ category: "TVs" }}>Shop TVs <ArrowRight /></Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <a href={TEL_LINK}><Phone /> Call to Order</a>
            </Button>
          </div>
          <div className="mt-16 flex flex-wrap gap-8 text-sm text-ink-foreground/60">
            {["Wide Color Gamut", "Motion Clarity", "Game Master 3.0", "Dolby Vision · Atmos"].map((t) => (
              <span key={t} className="border-l border-primary pl-3">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Truck, "Fast delivery", "Same-day in Nairobi"],
            [ShieldCheck, "Official warranty", "Genuine TCL products"],
            [Wrench, "Free installation", "On selected TVs"],
            [MessageCircle, "WhatsApp ordering", "Order in seconds"],
          ].map(([I, t, s]) => {
            const Icon = I as typeof Truck;
            return (
              <div key={t as string} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span>
                <div><p className="font-semibold">{t as string}</p><p className="text-sm text-muted-foreground">{s as string}</p></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-bold md:text-4xl">Shop by category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/products" search={{ category: c }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
              <img src={catImages[c]} alt={c} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-transparent" />
              <div className="absolute bottom-0 flex w-full items-center justify-between p-6 text-ink-foreground">
                <span className="font-display text-xl font-bold">{c}</span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary transition group-hover:rotate-[-45deg]"><ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Hot deals</span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Featured products</h2>
          </div>
          <Link to="/products" search={{}} className="flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ProductGrid items={featured.length ? featured : products.slice(0, 4)} loading={isLoading} />
      </section>

      {/* All by category */}
      {CATEGORIES.map((c) => {
        const items = products.filter((p) => p.category === c);
        if (!items.length) return null;
        return (
          <section key={c} className="mx-auto max-w-7xl px-4 pt-20">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">{c}</h2>
              <Link to="/products" search={{ category: c }} className="text-sm font-semibold text-primary">See all</Link>
            </div>
            <ProductGrid items={items.slice(0, 4)} />
          </section>
        );
      })}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-primary-foreground md:px-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-foreground/10" />
          <div className="relative max-w-xl">
            <h2 className="text-4xl font-extrabold md:text-5xl">Need help choosing?</h2>
            <p className="mt-4 text-lg opacity-90">Talk to our experts — we'll recommend the perfect fit and arrange delivery today.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="call" size="xl" asChild><a href={TEL_LINK}><Phone /> Call to Order</a></Button>
              <Button variant="whatsapp" size="xl" asChild>
                <a href={whatsappLink("Hello TCL Kenya, I need help choosing a product.")} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

