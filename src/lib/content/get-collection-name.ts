import type { Locale } from "@/config/i18n.config";

export function getCollectionName<T extends "pages">(collection: T, locale: Locale) {
	return `${locale}_${collection}` as const;
}
