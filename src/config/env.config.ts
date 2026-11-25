import { log } from "@acdh-oeaw/lib";
import { createEnv, ValidationError } from "@acdh-oeaw/validate-env/astro";
import * as v from "valibot";

const environment = import.meta.env.SSR
	? Object.assign({}, process.env, import.meta.env)
	: import.meta.env;

function parseEnvironment<TSchema extends v.GenericSchema>(schema: TSchema, input: unknown) {
	const result = v.safeParse(schema, input);
	if (result.success) return result.output;

	const message = "Invalid environment variables";
	log.error(`${message}:`, v.flatten(result.issues).nested);
	const error = new ValidationError(message, { cause: new v.ValiError(result.issues) });
	delete error.stack;
	throw error;
}

export const env = createEnv({
	environment,
	isClient: !import.meta.env.SSR,
	schemas: {
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "production"),
			});
			return parseEnvironment(Schema, input);
		},
		private(input) {
			const Schema = v.object({});
			return parseEnvironment(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				PUBLIC_APP_BASE_PATH: v.optional(v.pipe(v.string(), v.nonEmpty())),
				PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				PUBLIC_GOOGLE_SITE_VERIFICATION: v.optional(v.string()),
				PUBLIC_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
				PUBLIC_MATOMO_ID: v.optional(
					v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
				),
				PUBLIC_REDMINE_ID: v.pipe(
					v.string(),
					v.transform(Number),
					v.number(),
					v.integer(),
					v.minValue(1),
				),
			});
			return parseEnvironment(Schema, input);
		},
	},
	validation: parseEnvironment(
		v.optional(v.picklist(["disabled", "enabled", "public"]), "enabled"),
		environment.ENV_VALIDATION,
	),
});
