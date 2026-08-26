/**
 * Client-side TOFU trust for peer public keys.
 *
 * - First time we see a peer key → auto-trust (silent, social-app UX).
 * - If the key later changes → status "changed"; UI must confirm before send.
 * - Fingerprints are not secret; storing them in localStorage is fine.
 */

const STORAGE_KEY = "pgther_e2e_trust:v1";

export type KeyTrustStatus = "missing" | "new" | "trusted" | "changed";

export type KeyTrustResult = {
  status: KeyTrustStatus;
  fingerprint: string | null;
  previousFingerprint: string | null;
};

type TrustEntry = {
  fingerprint: string;
  trustedAt: number;
};

type TrustMap = Record<string, TrustEntry>;

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function readMap(): TrustMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TrustMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: TrustMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

/** Signal-style numeric safety number derived from SHA-256(SPKI). */
export async function fingerprintPublicKey(publicKeyB64: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", fromBase64(publicKeyB64));
  const bytes = new Uint8Array(hash);
  const groups: string[] = [];
  for (let i = 0; i < 6; i++) {
    const n = ((bytes[i * 2] ?? 0) << 8) | (bytes[i * 2 + 1] ?? 0);
    groups.push(String(n % 100_000).padStart(5, "0"));
  }
  return groups.join(" ");
}

export function getTrustedFingerprint(userId: string): string | null {
  if (!userId) return null;
  return readMap()[userId]?.fingerprint ?? null;
}

export function trustPublicKeyFingerprint(userId: string, fingerprint: string): void {
  if (!userId || !fingerprint) return;
  const map = readMap();
  map[userId] = { fingerprint, trustedAt: Date.now() };
  writeMap(map);
}

export function clearTrustedKey(userId: string): void {
  if (!userId) return;
  const map = readMap();
  if (!(userId in map)) return;
  delete map[userId];
  writeMap(map);
}

/**
 * Evaluate trust for a peer public key.
 * When status is "new", the caller should call `trustPublicKeyFingerprint`
 * to complete silent TOFU (or let the UI confirm explicitly).
 */
export async function evaluateKeyTrust(
  userId: string,
  publicKeyB64: string | null | undefined,
): Promise<KeyTrustResult> {
  if (!publicKeyB64) {
    return { status: "missing", fingerprint: null, previousFingerprint: null };
  }

  const fingerprint = await fingerprintPublicKey(publicKeyB64);
  const previous = getTrustedFingerprint(userId);

  if (!previous) {
    return { status: "new", fingerprint, previousFingerprint: null };
  }
  if (previous === fingerprint) {
    return { status: "trusted", fingerprint, previousFingerprint: previous };
  }
  return { status: "changed", fingerprint, previousFingerprint: previous };
}
