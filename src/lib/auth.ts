'use client';

const AUTH_KEY = 'mintytask_auth_user';
const AUTH_ACCOUNT_KEY = 'mintytask_auth_account';

export type AuthUser = {
  email: string;
};

export type AuthAccount = {
  email: string;
  password: string;
};

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function setAuthAccount(account: AuthAccount) {
  localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(account));
}

export function getAuthAccount(): AuthAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthAccount;
    if (!parsed?.email || !parsed?.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_ACCOUNT_KEY);
}

