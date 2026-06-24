// Shared age-gate helpers used by the registration flow, the OAuth interstitial,
// and the middleware that enforces the gate.
//
// Cove is not intended for children under 13 (COPPA), and its AI companion handles
// sensitive emotional content. We require a neutral self-attested date of birth at
// the front door. This is self-attestation, not identity verification — which is the
// standard, legally-accepted bar for a general-audience age screen.

export const MIN_AGE = 13;

// Cookie that records the user passed the age gate. Set server-side after a valid
// DOB is provided (at registration, or via the /age-check interstitial for OAuth
// sign-ups). Checked by middleware before granting access to the app.
export const AGE_COOKIE = "cove_age_confirmed";
export const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, in seconds

/**
 * Returns true if `dateOfBirth` (YYYY-MM-DD or ISO string) is at least `minAge`
 * years before today. Returns false for invalid/missing dates.
 */
export function isAtLeastAge(dateOfBirth: string, minAge: number = MIN_AGE): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= minAge;
}
