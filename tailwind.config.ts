import { createPreset } from "@acdh-oeaw/tailwindcss-preset";
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const preset = createPreset();

const config: Config = {
	content: [
		"./keystatic.config.tsx",
		"./content/**/*.@(md|mdx)",
		"./src/@(components|layouts|pages)/**/*.@(astro|css|ts|tsx)",
		"./src/styles/**/*.css",
	],
	darkMode: undefined,
	presets: [preset],
	theme: {
		extend: {
			borderWidth: {
				5: "5px",
			},
			colors: {
				brand: {
					DEFAULT: "hsl(210.3deg 65.6% 68% / <alpha-value>)",
					text: "hsl(210.3deg 65.6% 46% / <alpha-value>)",
					intent: "hsl(220.2deg 60.2% 32.5% / <alpha-value>)",
				},
				neutral: {
					...colors.neutral,
					text: "hsl(0deg 0% 28% / <alpha-value>)",
					separator: "hsl(0deg 0% 85% / <alpha-value>)",
				},
			},
			screens: {
				lg: "70rem",
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "none",
						/** Don't add quotes around `blockquote`. */
						"blockquote p:first-of-type::before": null,
						"blockquote p:last-of-type::after": null,
						/** Don't add backticks around inline `code`. */
						"code::before": null,
						"code::after": null,
					},
				},
			},
		},
	},
};

export default config;
