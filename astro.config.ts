import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import { loadEnv } from "vite";

// import { createConfig as createMdxConfig } from "./src/config/mdx.config";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

export default defineConfig({
	base: env.PUBLIC_APP_BASE_PATH,
	compressHTML: true,
	integrations: [
		// Enable the editor and its filesystem API only in local development.
		...(process.env.NODE_ENV === "development" ? [react(), keystatic()] : []),
		icon({
			/** @see https://www.astroicon.dev/reference/configuration/#include */
			include: {
				lucide: ["chevron-down", "menu", "message-circle", "search", "square-arrow-left", "x"],
			},
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: "preset-default",
						params: {
							overrides: {
								removeViewBox: false,
							},
						},
					},
				],
			},
		}),
		mdx(),
		sitemap(),
	],
	/** Use `@/lib/content/mdx.ts` instead of astro's built-in markdown processor. */
	// // @ts-expect-error Astro types are incomplete.
	// markdown: {
	// 	...(await createMdxConfig(defaultLocale)),
	// 	gfm: false,
	// 	smartypants: false,
	// 	syntaxHighlight: false,
	// },
	output: "static",
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	scopedStyleStrategy: "where",
	security: {
		checkOrigin: true,
		allowedDomains: env.PUBLIC_APP_BASE_URL
			? [{ hostname: new URL(env.PUBLIC_APP_BASE_URL).hostname }]
			: [],
	},
	server: {
		port: 3000,
	},
	site: env.PUBLIC_APP_BASE_URL,
	vite: {
		plugins: [tailwindcss()],
	},
});
