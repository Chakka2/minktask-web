'use client';

const STORAGE_KEY = 'earnhub_user_id';
const REFERRAL_KEY = 'mintytask_ref_code';

let memoryFallbackId: string | null = null;

function newId() {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c?.randomUUID) return `u_${c.randomUUID()}`;
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function newReferralCode() {
  return String(Math.floor(1000000 + Math.random() * 9000000));
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

export function clearClientUserId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  memoryFallbackId = null;
}

export function getReferralCode() {
  try {
    const existing = localStorage.getItem(REFERRAL_KEY);
    if (existing && /^\d{7}$/.test(existing)) return existing;
    const generated = newReferralCode();
    localStorage.setItem(REFERRAL_KEY, generated);
    return generated;
  } catch {
    return newReferralCode();
  }
}
