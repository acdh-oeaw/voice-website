import { createUrl, pick } from "@acdh-oeaw/lib";
import {
	type Collection,
	collection,
	type ComponentSchema,
	config,
	fields,
	NotEditable,
	type Singleton,
	singleton,
} from "@keystatic/core";
import { block, mark, repeating, wrapper } from "@keystatic/core/content-components";
import {
	DownloadIcon,
	GridIcon,
	ImageIcon,
	InfoIcon,
	ListIcon,
	SuperscriptIcon,
	UserIcon,
	VideoIcon,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { createAssetPaths, createPreviewUrl } from "@/config/content.config";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { getCollectionName } from "@/lib/content/get-collection-name";
import { useObjectUrl } from "@/lib/content/use-object-url";

function createCollection<T extends Record<string, ComponentSchema>, U extends string>(
	path: `/${string}/`,
	create: (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		path: Collection<any, any>["path"],
		assetPath: `/${string}/`,
		locale: Locale,
	) => Collection<T, U>,
) {
	return function createI18nCollection(locale: Locale): Collection<T, U> {
		const collection = create(`./content/${locale}${path}**`, `/content/${locale}${path}`, locale);

		return collection;
	};
}

function createSingleton<T extends Record<string, ComponentSchema>>(
	path: `/${string}/`,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	create: (path: Singleton<any>["path"], assetPath: `/${string}/`, locale: Locale) => Singleton<T>,
) {
	return function createI18nCollection(locale: Locale): Singleton<T> {
		const collection = create(`./content/${locale}${path}`, `/content/${locale}${path}`, locale);

		return collection;
	};
}

function createComponents(
	assetPath: `/${string}/`,
	components?: Array<
		| "Callout"
		| "Download"
		| "Figure"
		| "Footnote"
		| "Grid"
		| "GridItem"
		| "TableOfContents"
		| "TeamMember"
		| "Video"
	>,
) {
	const allComponents = {
		Callout: wrapper({
			label: "Callout",
			description: "Additional information.",
			icon: <InfoIcon />,
			schema: {
				kind: fields.select({
					label: "Kind",
					/** @see https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts */
					options: [
						{ label: "Caution", value: "caution" },
						{ label: "Important", value: "important" },
						{ label: "Note", value: "note" },
						{ label: "Tip", value: "tip" },
						{ label: "Warning", value: "warning" },
					],
					defaultValue: "note",
				}),
			},
		}),
		Download: mark({
			label: "Download",
			// description: "A link to an uploaded file.",
			tag: "a",
			className: "underline decoration-dotted",
			icon: <DownloadIcon />,
			schema: {
				href: fields.file({
					label: "File",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
			},
		}),
		Figure: wrapper({
			label: "Figure",
			description: "An image with caption.",
			icon: <ImageIcon />,
			schema: {
				href: fields.image({
					label: "Image",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
				alt: fields.text({
					label: "Image description for screen readers",
					// validation: { isRequired: false },
				}),
			},
			ContentView(props) {
				const contentType = props.value.href?.extension === "svg" ? "image/svg+xml" : undefined;
				const url = useObjectUrl(props.value.href?.data ?? null, contentType);

				return (
					<NotEditable>
						<figure>
							<img alt={props.value.alt} src={url ?? undefined} />
							<figcaption>{props.children}</figcaption>
						</figure>
					</NotEditable>
				);
			},
		}),
		Footnote: mark({
			label: "Footnote",
			icon: <SuperscriptIcon />,
			className: "underline decoration-dotted align-super text-xs",
			schema: {},
		}),
		Grid: repeating({
			label: "Grid",
			description: "A grid layout.",
			icon: <GridIcon />,
			children: ["GridItem"],
			schema: {
				variant: fields.select({
					label: "Variant",
					options: [
						{
							label: "Two columns",
							value: "two-columns",
						},
						{
							label: "Three columns",
							value: "three-columns",
						},
						{
							label: "Four columns",
							value: "four-columns",
						},
						{
							label: "Two columns, right is 2x as wide",
							value: "one-two-columns",
						},
						{
							label: "Two columns, right is 3x as wide",
							value: "one-three-columns",
						},
						{
							label: "Two columns, right is 4x as wide",
							value: "one-four-columns",
						},
					],
					defaultValue: "two-columns",
				}),
			},
		}),
		GridItem: wrapper({
			label: "Grid item",
			description: "A grid cell.",
			icon: <GridIcon />,
			forSpecificLocations: true,
			schema: {},
		}),
		TableOfContents: block({
			label: "Table of contents",
			description: "Insert a table of contents",
			icon: <ListIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					// validation: { isRequired: false },
				}),
			},
		}),
		TeamMember: block({
			label: "TeamMember",
			description: "A project team member.",
			icon: <UserIcon />,
			schema: {
				name: fields.text({
					label: "Name",
					validation: { isRequired: true },
				}),
				email: fields.text({
					label: "Email",
					validation: { isRequired: true },
				}),
				image: fields.image({
					label: "Image",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
				description: fields.text({
					label: "Description",
					multiline: true,
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				const contentType = props.value.image?.extension === "svg" ? "image/svg+xml" : undefined;
				const url = useObjectUrl(props.value.image?.data ?? null, contentType);

				return (
					<NotEditable>
						<article>
							<img alt="" src={url ?? undefined} />
							<div>
								<h2>{props.value.name}</h2>
								<a href={`mailto:${props.value.email}`}>{props.value.email}</a>
								<p>{props.value.description}</p>
							</div>
						</article>
					</NotEditable>
				);
			},
		}),
		Video: block({
			label: "Video",
			description: "An embedded video.",
			icon: <VideoIcon />,
			schema: {
				provider: fields.select({
					label: "Video provider",
					options: [
						{
							label: "YouTube",
							value: "youtube",
						},
					],
					defaultValue: "youtube",
				}),
				id: fields.text({
					label: "Video ID",
					validation: { isRequired: true },
				}),
				caption: fields.text({
					label: "Caption",
					// validation: { isRequired: false },
				}),
			},
			ContentView(props) {
				const { caption, id } = props.value;

				const href = String(
					createUrl({
						baseUrl: "https://www.youtube-nocookie.com",
						pathname: `/embed/${id}`,
					}),
				);

				return (
					<NotEditable>
						<figure>
							<iframe allowFullScreen={true} src={href} title="Video" />
							{caption ? <figcaption>{caption}</figcaption> : null}
						</figure>
					</NotEditable>
				);
			},
		}),
	};

	if (components == null) return allComponents;

	return pick(allComponents, components);
}

const collections = {
	pages: createCollection("/pages/", (path, assetPath, _locale) => {
		return collection({
			label: "Pages",
			path,
			slugField: "title",
			format: { contentField: "content" },
			previewUrl: createPreviewUrl("/{slug}"),
			entryLayout: "content",
			columns: ["title"],
			schema: {
				title: fields.slug({
					name: {
						label: "Title",
						validation: { isRequired: true },
					},
				}),
				image: fields.image({
					label: "Image",
					...createAssetPaths(assetPath),
					// validation: { isRequired: false },
				}),
				summary: fields.text({
					label: "Summary",
					multiline: true,
					validation: { isRequired: true },
				}),
				content: fields.mdx({
					label: "Content",
					options: {
						image: createAssetPaths(assetPath),
					},
					components: createComponents(assetPath),
				}),
			},
		});
	}),
};

const singletons = {
	indexPage: createSingleton("/index-page/", (path, assetPath, locale) => {
		return singleton({
			label: "Home page",
			path,
			format: { data: "json" },
			entryLayout: "form",
			previewUrl: createPreviewUrl("/"),
			schema: {
				hero: fields.object(
					{
						title: fields.text({
							label: "Title",
							validation: { isRequired: true },
						}),
						subtitle: fields.text({
							label: "Subtitle",
							multiline: true,
							validation: { isRequired: true },
						}),
						image: fields.image({
							label: "Image",
							...createAssetPaths(assetPath),
							// validation: { isRequired: true },
						}),
					},
					{
						label: "Hero section",
					},
				),
				main: fields.object(
					{
						sections: fields.blocks(
							{
								cardsSection: {
									label: "Cards section",
									itemLabel(props) {
										return props.fields.title.value + " (Cards)";
									},
									schema: fields.object(
										{
											title: fields.text({
												label: "Title",
												validation: { isRequired: true },
											}),
											variant: fields.select({
												label: "Variant",
												options: [
													{
														label: "Fluid",
														value: "fluid",
													},
													{
														label: "Full width",
														value: "full-width",
													},
													{
														label: "Two columns",
														value: "two-columns",
													},
													{
														label: "Three columns",
														value: "three-columns",
													},
													{
														label: "Four columns",
														value: "four-columns",
													},
												],
												defaultValue: "fluid",
											}),
											cards: fields.blocks(
												{
													custom: {
														label: "Custom card",
														itemLabel(props) {
															return props.fields.title.value;
														},
														schema: fields.object(
															{
																title: fields.text({
																	label: "Title",
																	validation: { isRequired: true },
																}),
																image: fields.image({
																	label: "Image",
																	...createAssetPaths(assetPath),
																	// validation: { isRequired: false },
																}),
																summary: fields.text({
																	label: "Summary",
																	multiline: true,
																	validation: { isRequired: true },
																}),
																link: fields.object(
																	{
																		label: fields.text({
																			label: "Label",
																			validation: { isRequired: true },
																		}),
																		href: fields.url({
																			label: "URL",
																			validation: { isRequired: true },
																		}),
																	},
																	{
																		label: "Link",
																	},
																),
															},
															{
																label: "Custom card",
															},
														),
													},
													page: {
														label: "Page card",
														itemLabel(props) {
															return props.fields.title.value;
														},
														schema: fields.object(
															{
																title: fields.text({
																	label: "Title",
																	validation: { isRequired: true },
																}),
																reference: fields.relationship({
																	label: "Page",
																	collection: getCollectionName("pages", locale),
																	validation: { isRequired: true },
																}),
																link: fields.object(
																	{
																		label: fields.text({
																			label: "Label",
																			validation: { isRequired: true },
																		}),
																	},
																	{
																		label: "Link",
																	},
																),
															},
															{
																label: "Page card",
															},
														),
													},
												},
												{
													label: "Cards",
													validation: { length: { min: 1 } },
												},
											),
										},
										{
											label: "Cards section",
										},
									),
								},
							},
							{
								label: "Sections",
								validation: { length: { min: 1 } },
							},
						),
					},
					{ label: "Main content" },
				),
			},
		});
	}),
	metadata: createSingleton("/metadata/", (path, _assetPath, _locale) => {
		return singleton({
			label: "Metadata",
			path,
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				title: fields.text({
					label: "Site title",
					validation: { isRequired: true },
				}),
				shortTitle: fields.text({
					label: "Short site title",
					validation: { isRequired: true },
				}),
				description: fields.text({
					label: "Site description",
					validation: { isRequired: true },
				}),
				twitter: fields.text({
					label: "Twitter handle",
					// validation: { isRequired: false },
				}),
			},
		});
	}),
	navigation: createSingleton("/navigation/", (path, _assetPath, locale) => {
		return singleton({
			label: "Navigation",
			path,
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				links: fields.blocks(
					{
						link: {
							label: "Link",
							itemLabel(props) {
								return props.fields.label.value + " (Link)";
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								href: fields.url({
									label: "URL",
									validation: { isRequired: true },
								}),
							}),
						},
						page: {
							label: "Page",
							itemLabel(props) {
								return props.fields.label.value + " (Page)";
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								reference: fields.relationship({
									label: "Page",
									collection: getCollectionName("pages", locale),
									validation: { isRequired: true },
								}),
							}),
						},
						menu: {
							label: "Menu",
							itemLabel(props) {
								return props.fields.label.value + " (Menu)";
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								links: fields.blocks(
									{
										link: {
											label: "Link",
											itemLabel(props) {
												return props.fields.label.value + " (Link)";
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													href: fields.url({
														label: "URL",
														validation: { isRequired: true },
													}),
												},
												{
													label: "Link",
												},
											),
										},
										page: {
											label: "Page",
											itemLabel(props) {
												return props.fields.label.value + " (Page)";
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													reference: fields.relationship({
														label: "Page",
														collection: getCollectionName("pages", locale),
														validation: { isRequired: true },
													}),
												},
												{
													label: "Page",
												},
											),
										},
										separator: {
											label: "Separator",
											schema: fields.empty(),
										},
									},
									{
										label: "Links",
										validation: { length: { min: 1 } },
									},
								),
							}),
						},
					},
					{
						label: "Links",
						validation: { length: { min: 1 } },
					},
				),
			},
		});
	}),
};

export default config({
	ui: {
		brand: {
			name: "VOICE",
			// @ts-expect-error `ReactNode` is a valid return type.
			mark: Logo,
		},
		navigation: {
			Pages: ["en_indexPage", "en_pages"],
			Navigation: ["en_navigation"],
			Settings: ["en_metadata"],
		},
	},
	storage:
		/**
		 * @see https://keystatic.com/docs/github-mode
		 */
		env.PUBLIC_KEYSTATIC_MODE === "github" &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	collections: {
		en_pages: collections.pages("en"),
	},
	singletons: {
		en_indexPage: singletons.indexPage("en"),

		en_metadata: singletons.metadata("en"),

		en_navigation: singletons.navigation("en"),
	},
});
