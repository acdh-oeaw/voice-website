# voice website

website for the voice project.

## how to run

prerequisites:

- [node.js 26.x](https://nodejs.org/en/download)
- [pnpm 12.x](https://pnpm.io/installation)

> [!TIP]
>
> you can use `pnpm` to install the required node.js version with `pnpm env use 26 --global`

set required environment variables in `.env.local`:

```bash
cp .env.local.example .env.local
```

adjust environment variables in `.github/workflows/validate.yml` and
`.github/workflows/build-deploy.yml`.

the default template accepts the following variables:

- `PUBLIC_REDMINE_ID` (required): service issue for this application in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker.
- `PUBLIC_APP_BASE_URL` (required): the base url for this application. the default of
  "http://localhost:3000" should be fine for local development.
- `PUBLIC_APP_BASE_PATH` (optional): set this when deploying to a path other than "/".
- `PUBLIC_BOTS` (required): whether this website can be indexed by web crawlers like the google bot.
  supported values are "disabled" and "enabled", defaults to "disabled".
- `PUBLIC_MATOMO_BASE_URL` and `PUBLIC_MATOMO_ID` (optional): set these to support client-side
  analytics with matomo.
- `PUBLIC_GOOGLE_SITE_VERIFICATION` (optional): set this to verify site ownership for google search
  console.
- `ENV_VALIDATION` (optional): whether environment variables should be validated. supported values
  are "disabled", "enabled" and "public" (only validate public variables, which can be useful in a
  docker build context to avoid having to pass secrets to `docker build`), defaults to "enabled".

the email service can be configured with these environment variables:

- `EMAIL_CONTACT_ADDRESS` (required): email will be sent to this address.
- `EMAIL_SMTP_SERVER` and `EMAIL_SMTP_PORT` (required): which smtp server to use.
- `EMAIL_SMTP_USERNAME` and `EMAIL_SMTP_PASSWORD` (optional): not needed on acdh-ch infrastructure,
  can be useful for testing with e.e. <https://ethereal.email>.

when adding new environment variables, don't forget to add them to `.env.local.example` as well.

install dependencies:

```bash
pnpm install
```

run a development server on <http://localhost:3000>:

```bash
pnpm run dev
```

> [!TIP]
>
> this template supports developing in containers. when opening the project in your editor, you
> should be prompted to re-open it in a devcontainer.

## how to edit content

Run `pnpm dev` and open <http://localhost:3000/keystatic>. The editor saves changes to local content
files. Commit and push those changes to publish them through the deployment workflow. If
`PUBLIC_APP_BASE_PATH` is set, prefix the editor URL with that path.

Keystatic and its API are available only during local development and are excluded from production.

## how to deploy

- ask a sysadmin to create a new acdh-ch kubernetes project.
- create a new namespace in that project via [rancher](https://rancher.acdh-dev.oeaw.ac.at), and set
  the `KUBE_NAMESPACE` github variable to that namespace.
- adjust the [`app_name`](./.github/workflows/build-deploy.yml#L36), which will be the name of the
  deployment in the above namespace.
- set the `PUBLIC_URL` github variable to the application's public url (e.g.
  "https://my-app.acdh-ch-dev.oeaw.ac.at"), and set the `KUBE_INGRESS_BASE_DOMAIN` to the public
  url's base domain (e.g. "acdh-ch-dev.oeaw.ac.at"). `PUBLIC_URL` should match
  `PUBLIC_APP_BASE_URL`.
- if you haven't yet, create a service issue in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker, and set the `SERVICE_ID` github variable
  to the issue number. this should match the `PUBLIC_REDMINE_ID` variable in your `.env.local` file.
- ensure required build args (prefixed with `PUBLIC_`) are referenced in both the
  [`Dockerfile`](./Dockerfile), as well as the [validation](./.github/workflows/validate.yml) and
  [deployment](./.github/workflows/build-deploy.yml) pipelines, and set as github variables.
- ensure required runtime environment variables are referenced in the
  [validation](./.github/workflows/validate.yml) and
  [deployment](./.github/workflows/build-deploy.yml) pipelines, and set as github secrets. github
  secrets need to be prefixed with `K8S_SECRET_` to be automatically copied to the runtime
  environment. in case you need secrets in the docker build context, you can
  [mount a secret in the Dockerfile](https://docs.docker.com/build/building/secrets/).
- ensure both the github repository, as well as the
  [package registry](https://github.com/orgs/acdh-oeaw/packages/container/my-app/settings) is set to
  public.

if everything is set up correctly, every git push to the `main` branch will create a new deployment
if the validation pipeline passes.

you can reference the [template repository](https://github.com/acdh-oeaw/template-website-astro) for
a working setup.

`pnpm build` generates the static site and Pagefind search index in `dist/`. The Dockerfile serves
those files with Caddy on port 3000 as an unprivileged user, using `Caddyfile`. `Dockerfile.static`
provides the same build for existing callers. Content updates require a new build. Compression is
handled by the existing Traefik middleware. CI restores Astro's assets cache and exports its updated
contents through the `astro-cache` Docker target for subsequent builds.

The Docker context uses an allowlist in `.dockerignore`; add new build inputs there when needed.
Caddy configuration is copied separately so changing it reuses the application build. Docker uses
the base image's Node installation, while pnpm runtime management remains available locally. Only
Astro's image and font caches are restored and exported.

The build prunes unreferenced images from `dist/assets/content/` and `dist/_astro/`, preserving
linked images and non-image downloads such as the VOICE manuals. Source assets remain in `public/`
for local editing and future builds. Run `pnpm test` to check asset pruning.
