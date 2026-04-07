'use client';

const STORAGE_KEY = 'earnhub_user_id';

let memoryFallbackId: string | null = null;

function newId() {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c?.randomUUID) return `u_${c.randomUUID()}`;
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable per-device id; falls back to in-memory if storage is blocked (private mode). */
export function getClientUserId() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const generated = newId();
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    if (!memoryFallbackId) memoryFallbackId = newId();
    return memoryFallbackId;
  }
}
