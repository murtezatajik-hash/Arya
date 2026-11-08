import type { AuthError } from "@supabase/supabase-js";

export type AuthErrorKey =
  | "generic"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "emailAlreadyRegistered"
  | "weakPassword"
  | "passwordMismatch"
  | "rateLimited"
  | "samePassword"
  | "sessionExpired"
  | "callback";

const errorKeyByCode: Record<string, AuthErrorKey> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "emailAlreadyRegistered",
  email_exists: "emailAlreadyRegistered",
  weak_password: "weakPassword",
  over_email_send_rate_limit: "rateLimited",
  over_request_rate_limit: "rateLimited",
  same_password: "samePassword",
  session_not_found: "sessionExpired",
  otp_expired: "sessionExpired",
};

export function authErrorKey(
  error: AuthError | null | undefined,
): AuthErrorKey {
  if (!error) {
    return "generic";
  }

  return errorKeyByCode[error.code ?? ""] ?? "generic";
}
