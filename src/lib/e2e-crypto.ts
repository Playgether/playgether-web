/**
 * E2E encryption utilities using Web Crypto API (no external dependencies).
 *
 * Scheme:
 *   - Key pair: RSA-OAEP 2048-bit (one per user, tied to account)
 *   - Private key protection: AES-GCM key derived via PBKDF2 from user password
 *   - Message encryption: random AES-GCM key per message
 *     - body encrypted once with AES
 *     - AES key wrapped separately for sender and recipient with their RSA public keys
 *
 * All values exchanged with the server are base64-encoded.
 */

const RSA_PARAMS: RsaHashedKeyGenParams = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const AES_KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 310_000;
const IV_LENGTH = 12; // bytes

// ── Helpers ───────────────────────────────────────────────────────────────────

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// ── Key generation ────────────────────────────────────────────────────────────

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(RSA_PARAMS, true, ["encrypt", "decrypt"]);
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", publicKey);
  return toBase64(spki);
}

export async function importPublicKey(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    fromBase64(b64),
    RSA_PARAMS,
    false,
    ["encrypt"]
  );
}

// ── PBKDF2 key derivation (for wrapping the private key) ─────────────────────

export function generateSalt(): string {
  return toBase64(randomBytes(32));
}

async function deriveWrappingKey(password: string, saltB64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// ── Private key wrapping / unwrapping ─────────────────────────────────────────

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  password: string,
  saltB64: string
): Promise<string> {
  const wrappingKey = await deriveWrappingKey(password, saltB64);
  const iv = randomBytes(IV_LENGTH);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    pkcs8
  );
  // prepend IV to ciphertext, return as base64
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return toBase64(combined.buffer);
}

export async function unwrapPrivateKey(
  encryptedB64: string,
  password: string,
  saltB64: string
): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKey(password, saltB64);
  const combined = fromBase64(encryptedB64);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const pkcs8 = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, wrappingKey, ciphertext);
  return crypto.subtle.importKey("pkcs8", pkcs8, RSA_PARAMS, true, ["decrypt"]);
}

// ── Message encryption / decryption ──────────────────────────────────────────

export interface EncryptedMessage {
  encryptedBody: string;
  encryptedKeyRecipient: string;
  encryptedKeySender: string;
  iv: string;
}

export async function encryptMessage(
  plaintext: string,
  recipientPublicKey: CryptoKey,
  senderPublicKey: CryptoKey
): Promise<EncryptedMessage> {
  const enc = new TextEncoder();
  const iv = randomBytes(IV_LENGTH);

  // Random AES-GCM key for this message
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );

  // Encrypt the message body
  const encryptedBodyBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(plaintext)
  );

  // Export the raw AES key to wrap it
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

  // Wrap AES key for recipient and sender separately
  const [encKeyRecipient, encKeySender] = await Promise.all([
    crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientPublicKey, rawAesKey),
    crypto.subtle.encrypt({ name: "RSA-OAEP" }, senderPublicKey, rawAesKey),
  ]);

  return {
    encryptedBody: toBase64(encryptedBodyBuf),
    encryptedKeyRecipient: toBase64(encKeyRecipient),
    encryptedKeySender: toBase64(encKeySender),
    iv: toBase64(iv.buffer),
  };
}

export async function decryptMessage(
  encryptedBody: string,
  encryptedKey: string,
  iv: string,
  privateKey: CryptoKey
): Promise<string> {
  // Unwrap the AES key
  const rawAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    fromBase64(encryptedKey)
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["decrypt"]
  );

  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    aesKey,
    fromBase64(encryptedBody)
  );

  return new TextDecoder().decode(plainBuf);
}

// ── Local storage (private key cache, persists while the user is logged in) ──

const LOCAL_KEY = "pgther_privkey_jwk";

export async function cachePrivateKey(privateKey: CryptoKey): Promise<void> {
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(jwk));
  // Notifica o E2ECryptoProvider (mesmo tab) para recarregar a chave imediatamente
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pgther-key-cached"));
  }
}

export async function loadCachedPrivateKey(): Promise<CryptoKey | null> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const jwk = JSON.parse(raw);
    const key = await crypto.subtle.importKey("jwk", jwk, RSA_PARAMS, false, ["decrypt"]);
    return key;
  } catch {
    return null;
  }
}

export function clearCachedPrivateKey(): void {
  localStorage.removeItem(LOCAL_KEY);
}
