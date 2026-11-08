import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type SessionRefresh = {
  user: User | null;
  applyTo: (response: NextResponse) => NextResponse;
};

/**
 * Refreshes the Supabase session and collects the cookies that need to be
 * written back to the response.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<SessionRefresh> {
  const pendingCookies: PendingCookie[] = [];
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    applyTo(response) {
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    },
  };
}
