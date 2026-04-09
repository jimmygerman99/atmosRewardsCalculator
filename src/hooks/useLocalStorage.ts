import { useState, useEffect } from 'react';

// Bump this when the shape of persisted state changes to avoid loading stale data.
const STORAGE_VERSION = 3;
const VERSION_KEY = 'atmos_storage_version';

// On first load, if the stored version doesn't match, wipe all atmos_ keys.
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored !== String(STORAGE_VERSION)) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('atmos_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const prefixedKey = `atmos_${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(prefixedKey);
      return item !== null ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } catch {
      // localStorage might be full or unavailable — fail silently
    }
  }, [prefixedKey, value]);

  return [value, setValue];
}
