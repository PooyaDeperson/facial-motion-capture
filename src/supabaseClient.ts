/*
 * Copyright (c) 2025 Pooya Moradi M. poamrd@gmail.com https://github.com/PooyaDeperson
 * Licensed under the MIT License with Attribution.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  storeDriveTokens,
  clearDriveTokens,
  notifyNoDriveScope,
} from "./useDriveSync";

// ── Environment detection ────────────────────────────────────────────────────
// On miniface.org and ANY subdomain (*.miniface.org) → use production vars.
// On every other host                                → use staging vars.
//
// Examples treated as production:
//   - miniface.org
//   - www.miniface.org
//   - app.miniface.org
//   - api.miniface.org
//   - anything.miniface.org

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "";

const isProductionHost =
  hostname === "miniface.org" || hostname.endsWith(".miniface.org");

const supabaseUrl = isProductionHost
  ? process.env.REACT_APP_SUPABASE_URL
  : process.env.REACT_APP_SUPABASE_STAGE_URL;

const supabaseAnonKey = isProductionHost
  ? process.env.REACT_APP_SUPABASE_ANON_KEY
  : process.env.REACT_APP_SUPABASE_STAGE_ANON_KEY;

// ── Availability flag ────────────────────────────────────────────────────────
// When env vars are absent (local dev, CI, preview without secrets) we export
// null instead of throwing so the rest of the app keeps running. Auth-dependent
// features should guard with `if (!supabase)` or `isSupabaseAvailable()`.

const missingVar = isProductionHost
  ? "REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY"
  : "REACT_APP_SUPABASE_STAGE_URL + REACT_APP_SUPABASE_STAGE_ANON_KEY";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    `[supabase] env vars not set (${missingVar}). ` +
      `Auth features will be disabled. Add them to .env.local to enable.`
  );
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Returns true when Supabase is properly configured and auth features are available. */
export const isSupabaseAvailable = (): boolean => supabase !== null;

// ── Capture Drive tokens on sign-in ──────────────────────────────────────────
// Supabase hands us provider_token / provider_refresh_token ONLY on the initial
// SIGNED_IN event after the OAuth redirect. We capture them here so every part
// of the app can call hasDriveAccess() / storeDriveTokens() without knowing
// about the auth flow.

if (supabase) {
  // Track whether this page load originated from an OAuth redirect so we can
  // distinguish a fresh sign-in (where missing provider_token = no Drive scope
  // was granted) from a regular page reload (where provider_token is never
  // present in existing sessions even if Drive was granted previously).

  const isOAuthRedirect =
    window.location.hash.includes("access_token") ||
    window.location.hash.includes("error") ||
    new URLSearchParams(window.location.search).has("code");

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.provider_token) {
      storeDriveTokens(
        session.provider_token,
        session.provider_refresh_token ?? null,
        session.user?.email
      );
    }

    if (
      event === "SIGNED_IN" &&
      !session?.provider_token &&
      isOAuthRedirect
    ) {
      // User just completed a fresh Google OAuth flow but did NOT grant the
      // Drive scope. Only fire on actual redirects — not on session restores.
      notifyNoDriveScope();
    }

    if (event === "SIGNED_OUT") {
      clearDriveTokens();
    }
  });
}