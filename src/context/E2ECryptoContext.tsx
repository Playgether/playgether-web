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
import { api } from "@/services/api";

interface E2ECryptoContextValue {
  isReady: boolean;
  needsUnlock: boolean;
  unlock: (password: string) => Promise<boolean>;
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

  // On mount: try to load the private key from sessionStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCachedPrivateKey();
      if (cancelled) return;
      if (cached) {
        privateKeyRef.current = cached;
        setIsReady(true);
        setNeedsUnlock(false);
      } else {
        try {
          const res = await api.get("/api/v1/users/my-keys/", { withCredentials: true });
          if (res.data?.encrypted_private_key) {
            setNeedsUnlock(true);
          }
        } catch {
          // Not logged in yet or network error — silently ignore
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await api.get("/api/v1/users/my-keys/", { withCredentials: true });
      const { encrypted_private_key, key_salt } = res.data;
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
    async (plaintext: string, recipientPublicKeyB64: string): Promise<EncryptedMessage | null> => {
      if (!privateKeyRef.current) return null;
      try {
        let senderPubKey = publicKeyRef.current;
        if (!senderPubKey) {
          const res = await api.get("/api/v1/users/my-keys/", { withCredentials: true });
          if (!res.data?.public_key) return null;
          senderPubKey = await importPublicKey(res.data.public_key);
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

  const clear = useCallback(() => {
    privateKeyRef.current = null;
    publicKeyRef.current = null;
    clearCachedPrivateKey();
    setIsReady(false);
    setNeedsUnlock(false);
  }, []);

  return (
    <E2ECryptoContext.Provider
      value={{ isReady, needsUnlock, unlock, encryptForUser, decrypt, clear }}
    >
      {children}
    </E2ECryptoContext.Provider>
  );
}

export const useE2ECrypto = () => useContext(E2ECryptoContext);

// Called at login time — unlocks cached key or generates new keys if account has none
export async function unlockE2EKeys(password: string): Promise<void> {
  try {
    const res = await api.get("/api/v1/users/my-keys/");
    const { encrypted_private_key, key_salt, public_key } = res.data;

    if (encrypted_private_key && key_salt) {
      // Already has keys — just unwrap and cache
      const privateKey = await unwrapPrivateKey(encrypted_private_key, password, key_salt);
      await cachePrivateKey(privateKey);
      return;
    }

    if (!public_key) {
      // No keys at all — generate and upload (account created before E2E feature)
      const keyPair = await generateKeyPair();
      const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
      const salt = generateSalt();
      const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, password, salt);
      await api.patch("/api/v1/users/upload-keys/", {
        public_key: exportedPublicKey,
        encrypted_private_key: wrappedPrivateKey,
        key_salt: salt,
      });
      await cachePrivateKey(keyPair.privateKey);
    }
  } catch {
    // Silently ignore — user can unlock manually from the conversations page
  }
}
