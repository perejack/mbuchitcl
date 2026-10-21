import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { ProductGrid } from "@/components/site/ProductCard";
import { CATEGORIES, productsQuery } from "@/lib/store";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "All Products — TCL Kenya" },
      { name: "description", content: "Browse TCL TVs, soundbars, refrigerators and washing machines with Kenyan prices." },
      { property: "og:title", content: "All Products — TCL Kenya" },
      { property: "og:description", content: "Browse the full TCL Kenya catalogue." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { data = [], isLoading } = useQuery(productsQuery());
  const items = data.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || `${p.name} ${p.description} ${p.features.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-4xl font-extrabold md:text-5xl">{category ?? "All products"}</h1>
      <p className="mt-2 text-muted-foreground">{items.length} products</p>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link to="/products" search={{ q }} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${!category ? "bg-ink text-ink-foreground" : "bg-surface border border-border hover:border-primary"}`}>All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c} to="/products" search={{ category: c, q }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${category === c ? "bg-ink text-ink-foreground" : "bg-surface border border-border hover:border-primary"}`}>
              {c}
            </Link>
          ))}
        </div>
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            defaultValue={q}
            onChange={(e) => navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }), replace: true })}
            placeholder="Search products…"
            className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-primary md:w-72"
          />
        </label>
      </div>
      <div className="mt-10">
        {!isLoading && items.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products found.</p>
        ) : (
          <ProductGrid items={items} loading={isLoading} />
        )}
      </div>
    </div>
  );
}
