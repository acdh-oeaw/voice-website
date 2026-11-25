import * as fs from "node:fs/promises";
import * as path from "node:path";

import { log } from "@acdh-oeaw/lib";

const imageExtension = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const textExtension = /\.(?:html|css|[cm]?js|json|svg|xml|txt|webmanifest)$/i;

/** Prune only generated output; conservatively retain images mentioned anywhere in text assets. */
export async function pruneAssets(directory: string): Promise<void> {
	const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true });
	const files = entries
		.filter((entry) => {
			return entry.isFile();
		})
		.map((entry) => {
			return path.join(entry.parentPath, entry.name);
		});
	const text = (
		await Promise.all(
			files
				.filter((file) => {
					return textExtension.test(file);
				})
				.map((file) => {
					return fs.readFile(file, "utf-8");
				}),
		)
	).join("\n");
	let bytes = 0;
	let count = 0;

	for (const file of files) {
		const relative = path.relative(directory, file).split(path.sep).join("/");
		if (!relative.startsWith("assets/content/") && !relative.startsWith("_astro/")) continue;
		if (!imageExtension.test(file)) continue;

		const name = path.basename(file);
		// Matching the filename also preserves relative URLs and URLs with a configured base path.
		const variants = [
			name,
			encodeURI(name),
			encodeURIComponent(name),
			name.replaceAll("&", "&amp;"),
		];
		if (
			variants.some((variant) => {
				return text.includes(variant);
			})
		)
			continue;

		bytes += (await fs.stat(file)).size;
		await fs.unlink(file);
		count++;
	}

	log.info(
		`Removed ${String(count)} unreferenced images (${(bytes / 1024 / 1024).toFixed(2)} MiB) from build output.`,
	);
}

if (import.meta.main) {
	await pruneAssets(path.resolve("dist"));
}
