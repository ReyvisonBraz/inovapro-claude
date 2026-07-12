import { useEffect, useRef, useCallback } from 'react';

const AUTOSAVE_DELAY = 2000;

export function useAutosave<T>(
  key: string,
  data: T,
  enabled: boolean = true
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // localStorage full or unavailable
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [key, data, enabled]);

  const load = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { load, clear };
}
