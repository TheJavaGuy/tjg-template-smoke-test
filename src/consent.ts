/**
 * Consent banner for Microsoft Clarity.
 *
 * Clarity is loaded only after the visitor accepts, and only when
 * VITE_CLARITY_ID is set at build time. The choice is persisted so the banner
 * shows once per browser.
 */
export const CONSENT_STORAGE_KEY = "clarity-consent";

type Consent = "granted" | "denied";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

function isConsent(value: string | null): value is Consent {
  return value === "granted" || value === "denied";
}

function readStoredConsent(): Consent | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return isConsent(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeConsent(consent: Consent): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Storage unavailable: the banner will show again on the next visit.
  }
}

/** Equivalent of the official Clarity snippet: a queued stub, then the async tag. */
export function loadClarity(projectId: string): void {
  if (window.clarity) return;
  const queue: ClarityFn = (...args) => {
    (queue.q ??= []).push(args);
  };
  window.clarity = queue;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  document.head.append(script);

  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
}

export function setupConsent(banner: HTMLElement, projectId: string | undefined): void {
  if (!projectId) {
    banner.remove();
    return;
  }

  const stored = readStoredConsent();
  if (stored === "granted") loadClarity(projectId);
  if (stored !== null) return;

  banner.hidden = false;
  banner.addEventListener("click", (event) => {
    const button =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>("[data-consent]")
        : null;
    const choice = button?.dataset["consent"] ?? null;
    if (!isConsent(choice)) return;
    storeConsent(choice);
    if (choice === "granted") loadClarity(projectId);
    banner.hidden = true;
  });
}
