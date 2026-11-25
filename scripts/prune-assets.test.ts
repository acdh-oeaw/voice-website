import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";

import { pruneAssets } from "./prune-assets.ts";

await test("prunes unused originals and generated images while preserving linked assets", async () => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "prune-assets-"));
	try {
		const fixtures: Record<string, string> = {
			"en/index.html":
				'<img src="/conference/_astro/hero.webp" srcset="/conference/_astro/hero-small.webp 480w"><a download href="../assets/content/download.jpg">Download</a><img src="/assets/content/photo%20one.jpg"><img src="/assets/content/marks%26symbols.png">',
			"_astro/styles.css": 'body { background: url("/assets/content/background.png"); }',
			"_astro/script.js": 'const image = "/assets/content/script-image.jpg";',
			"_astro/hero.webp": "optimized",
			"_astro/hero-small.webp": "optimized",
			"_astro/unused.jpg": "unused imported original",
			"assets/content/download.jpg": "linked download",
			"assets/content/photo one.jpg": "encoded name",
			"assets/content/marks&symbols.png": "encoded ampersand",
			"assets/content/background.png": "CSS image",
			"assets/content/script-image.jpg": "script image",
			"assets/content/poster.pdf": "non-image download",
			"assets/content/unused.jpg": "unused original",
			"assets/content/unused.svg": "<svg />",
			"assets/images/outside-scope.png": "outside pruning scope",
		};
		for (const [name, content] of Object.entries(fixtures)) {
			const file = path.join(directory, name);
			await fs.mkdir(path.dirname(file), { recursive: true });
			await fs.writeFile(file, content);
		}

		await pruneAssets(directory);
		await pruneAssets(directory);

		for (const [name, content] of Object.entries(fixtures)) {
			const file = path.join(directory, name);
			if (name.includes("unused.")) {
				await assert.rejects(fs.access(file), { code: "ENOENT" });
			} else {
				assert.equal(await fs.readFile(file, "utf-8"), content);
			}
		}
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
});
