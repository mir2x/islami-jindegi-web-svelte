# Islami Jindegi: web (SvelteKit)

The whole web app of **ইসলামী যিন্দেগী**, ported from the Next.js app in `../islami-jindegi-web`: the public site,
the readers (books, hadith, Quran) and the admin dashboard. It is a drop-in replacement: same URLs, same
environment variables, same API.

SvelteKit 3 · Svelte 5 (runes) · Tailwind CSS 4 · `adapter-node` · pnpm.

## Run

```bash
pnpm install
cp .env.example .env     # NEXT_PUBLIC_API_URL etc.
pnpm dev                 # http://localhost:5173
pnpm check               # svelte-check (types + a11y)
pnpm build && pnpm start # production server on :3000 (PORT / HOST to change)
```

The API's CORS list allows `localhost:3000`, so run the production server on 3000 (not `pnpm dev`) when testing
pages whose browser code calls the API directly (list filters, infinite scroll, audio, the whole admin).

## Configuration

Same variable names as the Next.js app, but read **when the server starts**, not baked in at build time:
changing the API URL only needs a restart. Declared in `src/env.ts`.

| Variable                       | Purpose                                                                     |
| ------------------------------ | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | API base URL                                                                |
| `NEXT_PUBLIC_SITE_URL`         | canonical origin (sitemaps, canonical / Open Graph URLs)                    |
| `NEXT_PUBLIC_NOINDEX`          | `1` on staging: robots, sitemap and meta all go noindex                     |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client id of the admin sign-in button                          |
| `COMPRESS`                     | `0` to skip in-process brotli/gzip when a reverse proxy already compresses |

## URLs and SEO parity

URLs are identical to the Next.js app: `/bn|/en` prefix, same paths, same `?page=N` / filter query params.

- `/` and any un-prefixed path → `308 /bn/...` (no `Accept-Language` sniffing); old Ember URLs (`/duas`, `/bayans`,
  `/contact-us`, `/donation`, `/madrasahs`) redirect too (`src/lib/server/redirects.ts`, applied in `hooks.server.ts`).
- Head metadata is returned as `seo` from each `load` (`buildSeo` in `src/lib/seo.ts`) and rendered once by
  `src/lib/components/Seo.svelte`: title, description, canonical, hreflang (only for the two translated paths),
  Open Graph, JSON-LD. Bangla-only content canonicalises `/en/...` to `/bn/...`.
- `/sitemap.xml` + `/sitemaps/<section>-<n>.xml` (hourly cache; a failing API never publishes a truncated file),
  `/robots.txt`, `/manifest.webmanifest`, `/sw.js` (no-store), `/.well-known/*`.
- The admin (`/{bn,en}/admin/**`) is client-rendered and always answers with `X-Robots-Tag: noindex, nofollow`.

## Architecture

```
src/
  env.ts, params.ts, hooks.server.ts   env vars, [locale]/[staticpage]/[section] matchers, redirects/headers/compression
  messages/{bn,en}/*.json              copied unchanged from the Next.js app
  routes/[locale=locale]/
    (public)/…                         pages with header + footer
    (reader)/…                         full-height readers (books, hadith, Quran): header only
    admin/…                            the dashboard (ssr = false, see below)
  lib/
    i18n/, server/i18n.ts              tiny i18n: pages ship only the message namespaces they use
    server/                            API client + SWR cache, list/detail loaders, sitemap, image cache
    components/{ui,shared,browser,…}   Popover, Modal, Overlay, list/detail engine, filters, share toolbar
    modules/<feature>/                 articles, bayan, masail, malfuzat, dua, news, madrasah, books, hadith, quran, …
    storage/                           localStorage-backed reactive state (bookmarks, last read, fonts)
    admin/                             everything of the dashboard (never imported by public code, except AdminEditButton)
```

Conventions worth knowing:

- **i18n**: `+page.server.ts` returns `msgs: loadMessages(locale, 'Namespace')`; components call `useT('Namespace')`.
  The header/footer namespaces come from the layout (`chrome`). Links are built with `localePath()`. ICU `{n, plural, …}`
  and `{n, number}` are supported by `interpolate` (`src/lib/i18n/index.ts`).
- **List/detail pages** (articles, bayan, masail, malfuzat, dua, books) share one engine in
  `src/lib/components/browser/` (`ListBrowser`, `ListState`): a module only supplies a `BrowserConfig` and its
  row/detail snippets. Filters update the URL in place (shallow routing) and refetch from the API; every page of
  the catalogue is also a real server-rendered URL with a crawlable pager. `snapshot` restores the loaded list when
  navigating back.
- **Data caching**: `src/lib/server/cache.ts` is an in-process stale-while-revalidate cache (the stand-in for
  Next's `revalidate`); repeat requests take a few milliseconds.
- **Images**: `/api/img?url=&w=` resizes CMS images to WebP with `sharp` (host allow-list, in-memory LRU,
  immutable cache headers); `<Img>` builds the `srcset`. This replaces `next/image`.
- **PDF reader**: `pdfjs-dist` directly (canvas + text layer), loaded on demand. PDFs go through `/api/pdf`.
- No file exceeds 300 lines; run `pnpm format` before committing.

### Admin dashboard

`routes/[locale=locale]/admin/**` is a client-only app (`+layout.ts`: `ssr = false`). The Google sign-in token lives in
`localStorage['ij-admin-auth']` (same key and shape as the Next dashboard, so a signed-in session carries over); real
enforcement is the API's `[Authorize]`. Its code is in `src/lib/admin/`:

- `api.ts` (fetch wrapper with the token, `ApiError`), `auth.svelte.ts`, `toast.svelte.ts`, `lookups.svelte.ts`
  (authors / categories / books shared by pickers and filters).
- `ui/`: Button, Field, Card, Select, Combobox (single / multi / remote search), Tabs, Pagination, SortHeader,
  ConfirmDialog, DragList, … (native-element based, no component library).
- `content/`: **one config-driven engine** for articles, bayan, masail, malfuzat, dua and news. `configs.ts` declares
  columns, filters and the form (tabs → sections → fields); `ContentList`, `ContentForm`, `SideList` and
  `ContentEdit` render any of them. Routes are `admin/[section=content]/…` (the `content` matcher lists the slugs).
- `list/` (`ListPage`, `DataTable`, `SimpleList`, `PagedLoader`: a stale response can never overwrite a newer one),
  `taxonomy/` (authors + categories: list, form, merge, delete-with-usage, reorder), `books/`, `notifications/`,
  `media/` (library, picker, upload queue with progress), `topics/`, `madrasah/`, `pages/`, `hijri/`, `offline/`,
  `admins/`.
- `editor/`: the rich-text editor on `@tiptap/core` (no React wrapper). tiptap is imported lazily, so it is only
  downloaded on screens that show an editor.
- The dashboard has its own light/dark preference (`ij-admin-theme`) and sidebar state (`ij-admin-sidebar`).
- Public detail pages show a floating "Edit" button (`components/shared/AdminEditButton.svelte`) to signed-in admins.

## Deploy

`Dockerfile` (multi-stage, `node:22-alpine`, non-root) and `.github/workflows/build.yml` mirror the Next.js
setup: `main` → `ghcr.io/<repo>:latest`, `staging` → `:staging` (noindex). The image needs only `sharp` and `adhan`
in `node_modules` at runtime. Pass the variables above as container environment; the build args just set defaults.

This app serves **everything** (public, readers and `/{bn,en}/admin/*`), so the reverse proxy can send all traffic to
it and the Next.js app can be retired.
