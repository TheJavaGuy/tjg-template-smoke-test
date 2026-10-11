import "./style.css";
import { setupConsent } from "./consent.ts";
import { setupThemeToggle } from "./theme.ts";

const toggle = document.querySelector<HTMLInputElement>("#theme-toggle");
if (toggle) setupThemeToggle(toggle);

const banner = document.querySelector<HTMLElement>("#consent-banner");
if (banner) setupConsent(banner, import.meta.env.VITE_CLARITY_ID);
