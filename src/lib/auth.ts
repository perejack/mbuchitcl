import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuthUser = { id: string; email: string | undefined };

type AuthState = {
  ready: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
};

const INITIAL: AuthState = { ready: false, user: null, isAdmin: false };

let state: AuthState = INITIAL;
let unsubscribe: (() => void) | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

async function refreshRoles(userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  setState({ isAdmin: !!data?.some((r) => r.role === "admin") });
}

/**
 * Registers the app's single Supabase auth subscription. Call once from the
 * root route; the optional callback receives identity-transition events so the
 * root can invalidate the router and query cache.
 */
export function initAuth(onEvent?: (event: string) => void) {
  if (typeof window === "undefined") return () => {};
  if (unsubscribe) return unsubscribe;

  supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    setState({ ready: true, user: user ? { id: user.id, email: user.email } : null });
    if (user) void refreshRoles(user.id);
  });

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
    const user = session?.user;
    setState({
      user: user ? { id: user.id, email: user.email } : null,
      isAdmin: false,
    });
    if (user) void refreshRoles(user.id);
    onEvent?.(event);
  });

  unsubscribe = () => data.subscription.unsubscribe();
  return unsubscribe;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => INITIAL,
  );
}
