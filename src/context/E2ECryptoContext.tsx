"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  cachePrivateKey,
  clearCachedPrivateKey,
  decryptMessage,
  encryptMessage,
  exportPublicKey,
  generateKeyPair,
  generateSalt,
  importPublicKey,
  loadCachedPrivateKey,
  unwrapPrivateKey,
  wrapPrivateKey,
  type EncryptedMessage,
} from "@/lib/e2e-crypto";

// ── helpers ───────────────────────────────────────────────────────────────────

async function fetchMyKeys(): Promise<{
  public_key: string | null;
  encrypted_private_key: string | null;
  key_salt: string | null;
}> {
  const res = await fetch("/api/users/my-keys", { credentials: "include" });
  if (!res.ok) throw new Error(`my-keys: ${res.status}`);
  return res.json();
}

async function uploadKeys(body: {
  public_key: string;
  encrypted_private_key: string;
  key_salt: string;
}): Promise<void> {
  const res = await fetch("/api/users/upload-keys", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`upload-keys: ${res.status}`);
}

// ── context ───────────────────────────────────────────────────────────────────

interface E2ECryptoContextValue {
  isReady: boolean;
  needsUnlock: boolean;
  /** Called at login time — auto-unlocks or generates keys, updates React state. */
  unlockOnLogin: (password: string) => Promise<void>;
  /** Manual unlock from the lock screen (when localStorage was cleared). */
  unlock: (password: string) => Promise<boolean>;
  regenerateKeys: (password: string) => Promise<boolean>;
  encryptForUser: (
    plaintext: string,
    recipientPublicKeyB64: string
  ) => Promise<EncryptedMessage | null>;
  decrypt: (
    encryptedBody: string,
    encryptedKey: string,
    iv: string,
    isSender: boolean,
    encryptedKeySender: string
  ) => Promise<string | null>;
  clear: () => void;
}

const E2ECryptoContext = createContext<E2ECryptoContextValue>(
  {} as E2ECryptoContextValue
);

export function E2ECryptoProvider({ children }: { children: React.ReactNode }) {
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyRef = useRef<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);

  // On mount: try localStorage first. No lock screen — auto-unlock happens at login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCachedPrivateKey();
      if (cancelled) return;
      if (cached) {
        privateKeyRef.current = cached;
        setIsReady(true);
        setNeedsUnlock(false);
      }
      // If no cached key, leave isReady=false — messages show 🔒 individually.
      // The user unlocks at login via unlockOnLogin/unlockE2EKeys.
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Called right after login (we have the plaintext password).
   * - Se já tem chaves no servidor: tenta decifrar com a senha do login.
   * - Se NÃO tem chaves: gera um par novo (primeira vez do usuário).
   * - Se tem chaves mas a senha não bate: NÃO regenera — mantém as chaves
   *   intactas para não perder mensagens antigas. O unlock manual fica como fallback.
   */
  const unlockOnLogin = useCallback(async (password: string): Promise<void> => {
    try {
      const data = await fetchMyKeys();
      const { encrypted_private_key, key_salt, public_key } = data;

      if (encrypted_private_key && key_salt) {
        // Chaves existem — tenta decifrar com a senha do login
        try {
          const privateKey = await unwrapPrivateKey(encrypted_private_key, password, key_salt);
          privateKeyRef.current = privateKey;
          await cachePrivateKey(privateKey);
          setIsReady(true);
          setNeedsUnlock(false);
        } catch {
          // Senha incorreta ou chave corrompida — silencioso, isReady=false
        }
        return;
      }

      // Nenhuma chave no servidor → primeira vez, gera e faz upload
      if (!public_key) {
        const keyPair = await generateKeyPair();
        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
        const salt = generateSalt();
        const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, password, salt);
        await uploadKeys({
          public_key: exportedPublicKey,
          encrypted_private_key: wrappedPrivateKey,
          key_salt: salt,
        });
        privateKeyRef.current = keyPair.privateKey;
        publicKeyRef.current = keyPair.publicKey;
        await cachePrivateKey(keyPair.privateKey);
        setIsReady(true);
        setNeedsUnlock(false);
      }
    } catch {
      // API inacessível — ignora silenciosamente, unlock manual é o fallback
    }
  }, []);

  /** Manual unlock: only used when localStorage was cleared (rare fallback). */
  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { encrypted_private_key, key_salt } = await fetchMyKeys();
      if (!encrypted_private_key || !key_salt) return false;
      const privateKey = await unwrapPrivateKey(encrypted_private_key, password, key_salt);
      privateKeyRef.current = privateKey;
      await cachePrivateKey(privateKey);
      setIsReady(true);
      setNeedsUnlock(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const encryptForUser = useCallback(
    async (
      plaintext: string,
      recipientPublicKeyB64: string
    ): Promise<EncryptedMessage | null> => {
      if (!privateKeyRef.current) return null;
      try {
        let senderPubKey = publicKeyRef.current;
        if (!senderPubKey) {
          const data = await fetchMyKeys();
          if (!data?.public_key) return null;
          senderPubKey = await importPublicKey(data.public_key);
          publicKeyRef.current = senderPubKey;
        }
        const recipientPubKey = await importPublicKey(recipientPublicKeyB64);
        return encryptMessage(plaintext, recipientPubKey, senderPubKey);
      } catch {
        return null;
      }
    },
    []
  );

  const decrypt = useCallback(
    async (
      encryptedBody: string,
      encryptedKeyRecipient: string,
      iv: string,
      isSender: boolean,
      encryptedKeySender: string
    ): Promise<string | null> => {
      if (!privateKeyRef.current) return null;
      try {
        const keyToUse = isSender ? encryptedKeySender : encryptedKeyRecipient;
        return await decryptMessage(encryptedBody, keyToUse, iv, privateKeyRef.current);
      } catch {
        return null;
      }
    },
    []
  );

  const regenerateKeys = useCallback(async (password: string): Promise<boolean> => {
    try {
      const keyPair = await generateKeyPair();
      const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
      const salt = generateSalt();
      const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, password, salt);
      await uploadKeys({
        public_key: exportedPublicKey,
        encrypted_private_key: wrappedPrivateKey,
        key_salt: salt,
      });
      privateKeyRef.current = keyPair.privateKey;
      publicKeyRef.current = keyPair.publicKey;
      await cachePrivateKey(keyPair.privateKey);
      setIsReady(true);
      setNeedsUnlock(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clear = useCallback(() => {
    privateKeyRef.current = null;
    publicKeyRef.current = null;
    clearCachedPrivateKey();
    setIsReady(false);
    setNeedsUnlock(false);
  }, []);

  return (
    <E2ECryptoContext.Provider
      value={{
        isReady,
        needsUnlock,
        unlockOnLogin,
        unlock,
        regenerateKeys,
        encryptForUser,
        decrypt,
        clear,
      }}
    >
      {children}
    </E2ECryptoContext.Provider>
  );
}

export const useE2ECrypto = () => useContext(E2ECryptoContext);

/**
 * @deprecated Use unlockOnLogin from useE2ECrypto() context instead.
 * Kept for backward compat (e.g. Google Auth flow).
 */
export async function unlockE2EKeys(password: string): Promise<void> {
  try {
    const res = await fetch("/api/users/my-keys", { credentials: "include" });
    if (!res.ok) return;
    const { encrypted_private_key, key_salt, public_key } = await res.json();

    if (encrypted_private_key && key_salt) {
      try {
        const privateKey = await unwrapPrivateKey(encrypted_private_key, password, key_salt);
        await cachePrivateKey(privateKey);
      } catch {
        // Senha incorreta ou chave corrompida — silencioso
      }
      return;
    }

    // Sem chaves → gera novo par (primeira vez)
    if (!public_key) {
      const keyPair = await generateKeyPair();
      const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
      const salt = generateSalt();
      const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, password, salt);
      await fetch("/api/users/upload-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ public_key: exportedPublicKey, encrypted_private_key: wrappedPrivateKey, key_salt: salt }),
      });
      await cachePrivateKey(keyPair.privateKey);
    }
  } catch {
    // silently ignore
  }
}
