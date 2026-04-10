"use client";

const RECENTLY_VIEWED_KEY = "istitdlal:recently-viewed";
const SAVED_VIDEOS_KEY = "istitdlal:saved-videos";
const PERSONALIZATION_EVENT = "istitdlal:personalization-change";
const MAX_RECENTLY_VIEWED = 8;

function isBrowser() {
  return typeof window !== "undefined";
}

function emitPersonalizationChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(PERSONALIZATION_EVENT));
}

function readStoredSlugs(key: string) {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeStoredSlugs(key: string, slugs: string[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(slugs));
  emitPersonalizationChange();
}

export function getRecentlyViewedSlugs() {
  return readStoredSlugs(RECENTLY_VIEWED_KEY);
}

export function getSavedVideoSlugs() {
  return readStoredSlugs(SAVED_VIDEOS_KEY);
}

export function recordRecentlyViewed(slug: string) {
  const nextSlugs = [slug, ...getRecentlyViewedSlugs().filter((item) => item !== slug)].slice(
    0,
    MAX_RECENTLY_VIEWED,
  );

  writeStoredSlugs(RECENTLY_VIEWED_KEY, nextSlugs);
}

export function isVideoSaved(slug: string) {
  return getSavedVideoSlugs().includes(slug);
}

export function toggleSavedVideo(slug: string) {
  const currentSlugs = getSavedVideoSlugs();
  const nextSlugs = currentSlugs.includes(slug)
    ? currentSlugs.filter((item) => item !== slug)
    : [slug, ...currentSlugs];

  writeStoredSlugs(SAVED_VIDEOS_KEY, nextSlugs);

  return nextSlugs.includes(slug);
}

export function getPersonalizationEventName() {
  return PERSONALIZATION_EVENT;
}
