export type CookieConsentValue = "accepted" | "rejected";

export const COOKIE_CONSENT_STORAGE_KEY = "playgether_cookie_consent";

/** Disparado no window sempre que o consentimento muda — scripts de analytics/marketing futuros devem escutar isso antes de carregar. */
export const COOKIE_CONSENT_EVENT = "cookie-consent-changed";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function setCookieConsent(value: CookieConsentValue) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent<CookieConsentValue>(COOKIE_CONSENT_EVENT, { detail: value }),
  );
}
