import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/SiteHeader";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — TCL Kenya" },
      { name: "description", content: "Sign in or create your TCL Kenya account to manage the store." },
      { property: "og:title", content: "Sign in — TCL Kenya" },
      { property: "og:description", content: "Sign in or create your TCL Kenya account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(raw?: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.25-4.53 6.16-4.53z" />
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.58 2.78c2.07-1.91 3.84-4.73 3.84-8.6z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L2.18 7.07C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.78c-.98.66-2.23 1.06-3.7 1.06-2.9 0-5.29-1.93-6.16-4.53l-3.66 2.84C3.99 20.53 7.7 23 12 23z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: safeRedirect(redirect) });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created!");
          navigate({ to: safeRedirect(redirect) });
        } else {
          setAwaitingConfirm(true);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message || "Sign-in failed. Please try again.");
    if (result.redirected) return;
  }

  const destination = safeRedirect(redirect);

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-6xl items-stretch gap-0 px-4 py-14 lg:grid-cols-2 lg:py-20">
      <aside className="relative hidden overflow-hidden rounded-[2rem] bg-ink p-12 text-ink-foreground lg:block">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex h-full flex-col">
          <Logo className="text-4xl" />
          <h2 className="mt-16 font-display text-4xl font-extrabold leading-tight">
            The official TCL store,<br />behind the scenes.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink-foreground/60">
            Sign in to manage the catalogue — add products, set prices, upload photos and keep the
            store up to date in real time.
          </p>
          <ul className="mt-auto space-y-4 text-sm text-ink-foreground/80">
            {[
              { icon: ShieldCheck, text: "Secure accounts with Google or email" },
              { icon: BadgeCheck, text: "Official warranty · Genuine TCL products" },
              { icon: Truck, text: "Free delivery within Nairobi" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex items-center justify-center rounded-[2rem] border border-border/70 bg-surface p-8 shadow-card sm:p-12">
        {awaitingConfirm ? (
          <div className="max-w-sm text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
              <MailCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-6 font-display text-2xl font-bold">Check your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Button variant="outline" className="mt-8" onClick={() => { setAwaitingConfirm(false); setMode("signin"); }}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to manage your store."
                : "The first account created becomes the store admin."}
            </p>

            <div className="mt-8 grid gap-3">
              <Button variant="outline" size="lg" onClick={() => social("google")} className="h-12">
                <GoogleIcon /> Continue with Google
              </Button>
              <Button variant="outline" size="lg" onClick={() => social("lovable")} className="h-12">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-primary text-[10px] font-black text-primary-foreground">L</span>
                Continue with Lovable
              </Button>
            </div>

            <div className="my-7 flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or {mode === "signin" ? "sign in" : "sign up"} with email <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="h-12 pl-10" autoComplete="email" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" required minLength={6} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="h-12 pl-10" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                </div>
              </div>
              <Button type="submit" variant="buy" size="lg" disabled={busy} className="mt-2 h-12">
                {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to TCL Kenya?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
