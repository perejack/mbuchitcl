import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { CATEGORIES, PHONE_DISPLAY, TEL_LINK, whatsappLink } from "@/lib/store";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <Logo className="text-4xl" />
          <p className="text-sm text-ink-foreground/60">Inspire greatness. Official TCL electronics & home appliances in Kenya.</p>
          <div className="flex gap-2">
            {[Facebook, Instagram, Youtube].map((I, i) => (
              <span key={i} className="grid h-10 w-10 place-items-center rounded-full bg-ink-foreground/10 transition hover:bg-primary">
                <I className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink-foreground/50">Products</h4>
          <ul className="space-y-3 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c}><Link to="/products" search={{ category: c }} className="hover:text-primary">{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink-foreground/50">Order</h4>
          <ul className="space-y-3 text-sm">
            <li><a href={TEL_LINK} className="hover:text-primary">Call to order</a></li>
            <li><a href={whatsappLink("Hello TCL Kenya, I'd like to place an order.")} target="_blank" rel="noreferrer" className="hover:text-primary">Order on WhatsApp</a></li>
            <li><Link to="/products" search={{}} className="hover:text-primary">Browse all products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink-foreground/50">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a href={TEL_LINK}>{PHONE_DISPLAY}</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />cc@tclkenya.co.ke</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Nairobi, Kenya</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-6 text-center text-xs text-ink-foreground/50">
        © {new Date().getFullYear()} TCL Kenya. All rights reserved.
      </div>
    </footer>
  );
}
