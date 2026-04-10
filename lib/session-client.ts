"use client";

const SESSION_STORAGE_KEY = "curated-spectrum-session-id";
const SESSION_COOKIE_NAME = "curated_spectrum_session";

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (stored) {
    writeCookie(SESSION_COOKIE_NAME, stored);
    return stored;
  }

  const cookieValue = readCookie(SESSION_COOKIE_NAME);

  if (cookieValue) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, cookieValue);
    return cookieValue;
  }

  const sessionId = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  writeCookie(SESSION_COOKIE_NAME, sessionId);
  return sessionId;
}
