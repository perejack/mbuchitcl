import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Package,
  PackagePlus,
  Star,
  StarOff,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatKsh, productsQuery, type Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TCL Kenya" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadImage(file: File, bucket = "product-images"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── blank form state ────────────────────────────────────────────────────────

type SpecRow = { key: string; value: string };

const BLANK = {
  name: "",
  slug: "",
  category: CATEGORIES[0] as string,
  description: "",
  price: "",
  old_price: "",
  badge: "",
  in_stock: true,
  featured: false,
  image_url: "",
  gallery: [] as string[],
  features: [""],
  specs: [] as SpecRow[],
  sort_order: "0",
};

type FormState = typeof BLANK;

function productToForm(p: Product): FormState {
  const specs = Object.entries((p.specs ?? {}) as Record<string, string>).map(
    ([key, value]) => ({ key, value: String(value) })
  );
  return {
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description ?? "",
    price: String(p.price),
    old_price: p.old_price ? String(p.old_price) : "",
    badge: p.badge ?? "",
    in_stock: p.in_stock,
    featured: p.featured,
    image_url: p.image_url ?? "",
    gallery: p.gallery ?? [],
    features: p.features.length ? p.features : [""],
    specs,
    sort_order: String(p.sort_order ?? 0),
  };
}

function formToPayload(f: FormState) {
  const specsObj: Record<string, string> = {};
  f.specs.forEach(({ key, value }) => {
    if (key.trim()) specsObj[key.trim()] = value;
  });
  return {
    name: f.name.trim(),
    slug: f.slug.trim() || slugify(f.name),
    category: f.category,
    description: f.description.trim(),
    price: parseFloat(f.price) || 0,
    old_price: f.old_price ? parseFloat(f.old_price) : null,
    badge: f.badge.trim() || null,
    in_stock: f.in_stock,
    featured: f.featured,
    image_url: f.image_url || null,
    gallery: f.gallery.filter(Boolean),
    features: f.features.map((s) => s.trim()).filter(Boolean),
    specs: specsObj,
    sort_order: parseInt(f.sort_order) || 0,
    updated_at: new Date().toISOString(),
  };
}

// ─── Image upload widget ─────────────────────────────────────────────────────

function ImageUploader({
  value,
  onChange,
  label = "Main image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted transition hover:border-primary">
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 transition group-hover:opacity-100">
              <Button size="sm" variant="glass" onClick={() => ref.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}
                Change
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onChange("")}>
                <X className="h-4 w-4" /> Remove
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center gap-2 p-8 text-muted-foreground hover:text-primary"
            onClick={() => ref.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="animate-spin h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
            <span className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload"}</span>
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="or paste image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs"
        />
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

// ─── Gallery uploader ────────────────────────────────────────────────────────

function GalleryUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function pickMany(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const newUrls = await Promise.all(files.map((f) => uploadImage(f)));
      onChange([...urls, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>Gallery images</Label>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition"
        >
          {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={pickMany} />
    </div>
  );
}

// ─── Product form dialog ─────────────────────────────────────────────────────

function ProductFormDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: { product?: Product } | null;
}) {
  const qc = useQueryClient();
  const editing = !!initial?.product;
  const [form, setForm] = useState<FormState>(
    initial?.product ? productToForm(initial.product) : { ...BLANK }
  );
  const [tab, setTab] = useState("basics");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !editing) next.slug = slugify(value as string);
      return next;
    });
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.price) return toast.error("Price is required");
    setBusy(true);
    try {
      const payload = formToPayload(form);
      if (editing && initial?.product) {
        const { error } = await supabase.from("products").update(payload).eq("id", initial.product.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert(payload as any);
        if (error) throw error;
        toast.success("Product added!");
      }
      await qc.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  // Re-sync form when initial changes (e.g., dialog re-opened for different product)
  // We do this via key on the dialog, so no extra effect needed.

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit product" : "Add new product"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the product details below." : "Fill in the details to add a new product to the store."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="basics" className="flex-1">Basics</TabsTrigger>
            <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Details & Specs</TabsTrigger>
          </TabsList>

          {/* ── Basics ── */}
          <TabsContent value="basics" className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label>Product name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. TCL 65 P755 4K UHD TV" />
            </div>
            <div className="grid gap-2">
              <Label>Slug (URL key)</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="tcl-65-p755" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Badge label</Label>
                <Input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="e.g. New, Hot Deal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price (KSh) *</Label>
                <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="89999" />
              </div>
              <div className="grid gap-2">
                <Label>Old price (KSh)</Label>
                <Input type="number" value={form.old_price} onChange={(e) => set("old_price", e.target.value)} placeholder="109999" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Sort order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Short marketing description…" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div>
                <p className="font-semibold">In stock</p>
                <p className="text-xs text-muted-foreground">Show as available</p>
              </div>
              <Switch checked={form.in_stock} onCheckedChange={(v) => set("in_stock", v)} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div>
                <p className="font-semibold">Featured</p>
                <p className="text-xs text-muted-foreground">Show on homepage</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </TabsContent>

          {/* ── Media ── */}
          <TabsContent value="media" className="mt-4 grid gap-6">
            <ImageUploader value={form.image_url} onChange={(url) => set("image_url", url)} label="Main product image" />
            <GalleryUploader urls={form.gallery} onChange={(urls) => set("gallery", urls)} />
          </TabsContent>

          {/* ── Details & Specs ── */}
          <TabsContent value="details" className="mt-4 grid gap-6">
            {/* Features */}
            <div className="grid gap-3">
              <Label>Key features (bullet points)</Label>
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={f}
                    onChange={(e) => {
                      const next = [...form.features];
                      next[i] = e.target.value;
                      set("features", next);
                    }}
                    placeholder={`Feature ${i + 1}`}
                  />
                  <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => set("features", form.features.filter((_, j) => j !== i))}
                  ><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("features", [...form.features, ""])}>
                + Add feature
              </Button>
            </div>

            {/* Specs */}
            <div className="grid gap-3">
              <Label>Specifications</Label>
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s.key}
                    onChange={(e) => {
                      const next = [...form.specs];
                      next[i] = { ...s, key: e.target.value };
                      set("specs", next);
                    }}
                    placeholder="Spec name"
                    className="w-2/5"
                  />
                  <Input
                    value={s.value}
                    onChange={(e) => {
                      const next = [...form.specs];
                      next[i] = { ...s, value: e.target.value };
                      set("specs", next);
                    }}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => set("specs", form.specs.filter((_, j) => j !== i))}
                  ><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("specs", [...form.specs, { key: "", value: "" }])}>
                + Add spec
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="buy" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            {editing ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirmation ─────────────────────────────────────────────────────

function DeleteDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!product) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Product deleted");
      await qc.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{product?.name}</strong> will be permanently removed from the store. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Product row ─────────────────────────────────────────────────────────────

function ProductRow({
  p,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStock,
}: {
  p: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  onToggleStock: () => void;
}) {
  return (
    <tr className="group border-b border-border last:border-0 hover:bg-muted/40 transition">
      <td className="py-3 pl-4 pr-2">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="font-semibold leading-tight">{p.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{p.slug}</p>
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <Badge variant="secondary">{p.category}</Badge>
      </td>
      <td className="px-3 py-3 font-semibold">
        {formatKsh(Number(p.price))}
        {p.old_price && (
          <span className="ml-2 text-xs text-muted-foreground line-through">{formatKsh(Number(p.old_price))}</span>
        )}
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {p.in_stock ? "In stock" : "Out of stock"}
        </span>
      </td>
      <td className="hidden px-3 py-3 lg:table-cell">
        <button type="button" onClick={onToggleFeatured} title="Toggle featured" className="text-muted-foreground hover:text-primary transition">
          {p.featured ? <Star className="h-4 w-4 fill-primary text-primary" /> : <StarOff className="h-4 w-4" />}
        </button>
      </td>
      <td className="py-3 pr-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
          <Button size="icon" variant="ghost" onClick={onToggleStock} title="Toggle stock">
            {p.in_stock ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onEdit} title="Edit">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} title="Delete" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.in_stock).length,
    featured: products.filter((p) => p.featured).length,
    outOfStock: products.filter((p) => !p.in_stock).length,
  };

  async function toggleFeatured(p: Product) {
    const { error } = await supabase.from("products").update({ featured: !p.featured }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(p.featured ? "Removed from featured" : "Added to featured");
  }

  async function toggleStock(p: Product) {
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(p.in_stock ? "Marked out of stock" : "Marked in stock");
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to store
          </Link>
          <h1 className="text-3xl font-extrabold md:text-4xl">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your product catalogue</p>
        </div>
        <Button variant="buy" size="lg" onClick={openAdd}>
          <PackagePlus className="h-5 w-5" /> Add product
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total products", value: stats.total, color: "bg-primary/10 text-primary" },
          { label: "In stock", value: stats.inStock, color: "bg-green-100 text-green-700" },
          { label: "Out of stock", value: stats.outOfStock, color: "bg-red-100 text-red-600" },
          { label: "Featured", value: stats.featured, color: "bg-amber-100 text-amber-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <span className={`inline-block rounded-xl px-3 py-1 text-2xl font-extrabold ${color}`}>{value}</span>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 animate-spin" /> Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Package className="h-10 w-10 opacity-30" />
            <p className="font-medium">{search || catFilter !== "All" ? "No products match your filters" : "No products yet"}</p>
            {!search && catFilter === "All" && (
              <Button variant="buy" onClick={openAdd}><PackagePlus /> Add your first product</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="py-3 pl-4 pr-2">Image</th>
                  <th className="px-3 py-3">Name / Slug</th>
                  <th className="hidden px-3 py-3 md:table-cell">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="hidden px-3 py-3 md:table-cell">Stock</th>
                  <th className="hidden px-3 py-3 lg:table-cell">Featured</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    p={p}
                    onEdit={() => openEdit(p)}
                    onDelete={() => setDeleting(p)}
                    onToggleFeatured={() => toggleFeatured(p)}
                    onToggleStock={() => toggleStock(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {formOpen && (
        <ProductFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          initial={editing ? { product: editing } : {}}
        />
      )}
      <DeleteDialog
        product={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
