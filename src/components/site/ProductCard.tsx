import { Link, useNavigate } from "@tanstack/react-router";
import { Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { discount, formatKsh, TEL_LINK, type Product } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const navigate = useNavigate();
  const off = discount(p);
  const go = () => navigate({ to: "/product/$slug", params: { slug: p.slug } });
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card transition duration-500 hover:-translate-y-1.5 hover:border-primary/30">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="relative block aspect-square overflow-hidden bg-muted">
        {p.image_url && (
          <img src={p.image_url} alt={p.name} loading="lazy" width={1024} height={1024}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {off > 0 && <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">-{off}%</span>}
          {p.badge && !p.badge.startsWith("-") && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-ink-foreground">{p.badge}</span>}
        </div>
        {!p.in_stock && <span className="absolute right-4 top-4 rounded-full bg-surface px-3 py-1 text-xs font-semibold">Out of stock</span>}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{p.category}</span>
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug hover:text-primary">{p.name}</h3>
        </Link>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold">{formatKsh(Number(p.price))}</span>
          {p.old_price && off > 0 && <span className="text-sm text-muted-foreground line-through">{formatKsh(Number(p.old_price))}</span>}
        </div>
        <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
          {p.features.slice(0, 3).map((f) => (
            <li key={f} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{f}</li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="buy" size="lg" onClick={go} className="px-3"><ShoppingBag /> Buy Now</Button>
          <Button variant="call" size="lg" asChild className="px-3">
            <a href={TEL_LINK}><Phone /> Call to Order</a>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, loading }: { items: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/5] animate-pulse rounded-3xl bg-muted" />)}
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
