import type en from "@/messages/en.json";
import type metadata from "~/content/en/metadata/index.json";

export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isValidLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export type IntlMessages = typeof en & { metadata: typeof metadata };

export interface Translations extends Record<Locale, IntlMessages> {
	en: typeof en & { metadata: typeof metadata };
}
