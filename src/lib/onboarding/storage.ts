import { DEFAULT_DRAFT, type OnboardingDraft } from "./schema";

export const DRAFT_KEY = "lk_onboarding_draft_v1";

export function loadLocalDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return { ...DEFAULT_DRAFT, ...(JSON.parse(raw) as OnboardingDraft) };
  } catch {
    return null;
  }
}

export function saveLocalDraft(draft: OnboardingDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  } catch {}
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
