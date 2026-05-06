'use client';

const KEY_LAST_THEME = 'stackdeck:last-theme:v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadLastTheme<T>(): T | null {
  if (typeof window === 'undefined') return null;
  return safeParse<T>(window.localStorage.getItem(KEY_LAST_THEME));
}

export function saveLastTheme<T>(theme: T): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY_LAST_THEME, JSON.stringify(theme));
}
