"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getPreferences, patchPreferences, type UserPreferences, type PreferencesPatch } from "@/services/userPreferences";

interface UserPreferencesContextValue {
  prefs: UserPreferences | null;
  loading: boolean;
  updatePrefs: (patch: PreferencesPatch) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue>({
  prefs: null,
  loading: true,
  updatePrefs: async () => {},
});

function applyPrefsToDOM(prefs: UserPreferences) {
  const html = document.documentElement;

  // Reduce animations
  html.classList.toggle("reduce-animations", prefs.reduce_animations);

  // UI density
  html.classList.toggle("density-compact", prefs.ui_density === "compact");

  // Font size
  html.classList.remove("font-size-small", "font-size-large");
  if (prefs.font_size === "small") html.classList.add("font-size-small");
  if (prefs.font_size === "large") html.classList.add("font-size-large");
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferences()
      .then((data) => {
        setPrefs(data);
        applyPrefsToDOM(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePrefs = useCallback(async (patch: PreferencesPatch) => {
    if (!prefs) return;
    const optimistic = { ...prefs, ...patch };
    setPrefs(optimistic);
    applyPrefsToDOM(optimistic);
    try {
      const updated = await patchPreferences(patch);
      setPrefs(updated);
      applyPrefsToDOM(updated);
    } catch {
      setPrefs(prefs);
      applyPrefsToDOM(prefs);
      throw new Error("Failed to save preference");
    }
  }, [prefs]);

  return (
    <UserPreferencesContext.Provider value={{ prefs, loading, updatePrefs }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}
