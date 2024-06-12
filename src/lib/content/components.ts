/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { MDXComponents } from "mdx/types";

import Callout from "@/components/content/callout.astro";
import Download from "@/components/content/download.astro";
import Figure from "@/components/content/figure.astro";
import FootnoteContent from "@/components/content/footnote-content.astro";
import FootnoteReference from "@/components/content/footnote-reference.astro";
import FootnotesSection from "@/components/content/footnote-section.astro";
import Grid from "@/components/content/grid.astro";
import GridItem from "@/components/content/grid-item.astro";
import Img from "@/components/content/img.astro";
import TableOfContents from "@/components/content/table-of-contents.astro";
import TeamMember from "@/components/content/team-member.astro";
import Video from "@/components/content/video.astro";
import Link from "@/components/link.astro";

export function useMDXComponents(): MDXComponents {
	return {
		// @ts-expect-error It's fine.
		a: Link,
		Callout,
		Download,
		Figure,
		FootnoteContent,
		FootnoteReference,
		FootnotesSection,
		Grid,
		GridItem,
		// @ts-expect-error It's fine.
		img: Img,
		TableOfContents,
		TeamMember,
		Video,
	};
}
