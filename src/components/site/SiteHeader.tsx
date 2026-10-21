import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Phone, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, PHONE_DISPLAY, TEL_LINK } from "@/lib/store";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-3xl font-black tracking-tighter text-primary ${className}`}>TCL</span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  async function signOut() {
    setUserMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.success("Signed out");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
          <span className="opacity-80">Free delivery within Nairobi · Official warranty</span>
          <a href={TEL_LINK} className="flex items-center gap-1.5 font-semibold hover:text-primary">
            <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/"><Logo /></Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/products"
              search={{ category: c }}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ includeSearch: true }}
            >
              {c}
            </Link>
          ))}
          <Link to="/products" search={{}} className="text-sm font-medium text-foreground/80 hover:text-primary">
            All Products
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Call button */}
          <a
            href={TEL_LINK}
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 sm:flex"
          >
            <Phone className="h-4 w-4" /> Call to Order
          </a>

          {/* Auth button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold shadow-card transition hover:border-primary"
                aria-label="Account menu"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate sm:block text-xs">{user.email}</span>
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-xs font-semibold text-muted-foreground">Signed in as</p>
                      <p className="mt-0.5 truncate text-sm font-bold">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Admin</span>
                      )}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-muted transition"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              <User className="h-4 w-4" /> Sign in
            </Link>
          )}

          {/* Hamburger */}
          <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-4 py-3 lg:hidden">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/products" search={{ category: c }} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-muted">
              {c}
            </Link>
          ))}
          <Link to="/products" search={{}} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-muted">
            All Products
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium hover:bg-muted text-primary">
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-destructive hover:bg-muted text-left">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" search={{ redirect: undefined }} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium hover:bg-muted">
              <User className="h-4 w-4" /> Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
