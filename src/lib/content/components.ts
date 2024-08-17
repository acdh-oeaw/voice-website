/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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

const components = {
	a: Link,
	Callout,
	Download,
	Figure,
	FootnoteContent,
	FootnoteReference,
	FootnotesSection,
	Grid,
	GridItem,
	img: Img,
	TableOfContents,
	TeamMember,
	Video,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
