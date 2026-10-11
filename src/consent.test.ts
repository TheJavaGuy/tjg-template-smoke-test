import { beforeEach, describe, expect, it } from "vite-plus/test";
import { CONSENT_STORAGE_KEY, setupConsent } from "./consent.ts";

function mountBanner(): HTMLElement {
  document.body.innerHTML = `
    <div id="consent-banner" hidden>
      <button type="button" data-consent="granted">Accept</button>
      <button type="button" data-consent="denied">Decline</button>
    </div>`;
  const banner = document.querySelector<HTMLElement>("#consent-banner");
  if (!banner) throw new Error("banner missing");
  return banner;
}

const clarityScript = (): HTMLScriptElement | null =>
  document.head.querySelector('script[src^="https://www.clarity.ms/tag/"]');

describe("setupConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.clarity;
    clarityScript()?.remove();
  });

  it("removes the banner when no project id is configured", () => {
    const banner = mountBanner();
    setupConsent(banner, undefined);
    expect(document.querySelector("#consent-banner")).toBeNull();
    expect(clarityScript()).toBeNull();
  });

  it("shows the banner and loads Clarity only after acceptance", () => {
    const banner = mountBanner();
    setupConsent(banner, "abc123");
    expect(banner.hidden).toBe(false);
    expect(clarityScript()).toBeNull();

    banner.querySelector<HTMLButtonElement>('[data-consent="granted"]')?.click();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(clarityScript()?.src).toBe("https://www.clarity.ms/tag/abc123");
    expect(window.clarity?.q).toEqual([
      ["consentv2", { ad_Storage: "denied", analytics_Storage: "granted" }],
    ]);
    expect(banner.hidden).toBe(true);
  });

  it("stores a refusal and never loads Clarity", () => {
    const banner = mountBanner();
    setupConsent(banner, "abc123");
    banner.querySelector<HTMLButtonElement>('[data-consent="denied"]')?.click();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("denied");
    expect(clarityScript()).toBeNull();
    expect(banner.hidden).toBe(true);
  });

  it("respects a stored decision without showing the banner", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const banner = mountBanner();
    setupConsent(banner, "abc123");
    expect(banner.hidden).toBe(true);
    expect(clarityScript()).not.toBeNull();
  });
});
