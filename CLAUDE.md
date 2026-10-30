# CLAUDE.md

SvelteKit 3 web app of Islami Jindegi (public site, readers and admin dashboard) for the Rust API in
`../islami-jindegi-rust-api`. See README.md for the architecture, configuration and deploy flow.

## Commands

```sh
pnpm install
pnpm dev                  # http://localhost:5173
pnpm check                # must be clean (0 errors, 0 warnings)
pnpm format               # prettier; run before finishing
pnpm build && PORT=3000 pnpm start
```

Test client-side fetches on the production server at **port 3000**: the API's CORS allows `localhost:3000` and not
the dev server's port. Env vars are `PUBLIC_API_URL`, `PUBLIC_SITE_URL`, `PUBLIC_GOOGLE_CLIENT_ID`, `PUBLIC_NOINDEX`,
`COMPRESS`, `API_INTERNAL_URL` (`src/env.ts`, `.env.example`).

## Rules for this repo

- **No file over 300 lines** (400 only in rare cases). Split components/modules instead.
- **Reuse before writing**: list/detail pages go through `src/lib/components/browser/`, overlays through
  `ui/Overlay.svelte`, search/bookmark modals through `shared/SearchOverlay.svelte` / `BookmarksOverlay.svelte`.
  In the admin, a content module is a config in `src/lib/admin/content/configs.ts`, simple CRUD lists use
  `admin/list/SimpleList.svelte`, forms use `admin/ui/FormFrame.svelte` + `saveForm`, and single-record screens load
  through `admin/ui/LoadItem.svelte`.
- **Performance is a requirement**: server `load`s use the cached fetchers in `src/lib/server/`, client bundles stay
  small (pdf.js and tiptap are lazy), images go through `<Img>`. Don't add heavy dependencies; build-time-only
  packages go in `devDependencies` (the image ships only `adhan` and `sharp`).
- pnpm only.
- Browsers call the API at `PUBLIC_API_URL`; only server-side code may use `API_INTERNAL_URL` (the container network is
  not reachable from a browser).

## SvelteKit 3 differences from v2 (do not write v2 code)

- Config lives in `vite.config.ts` (`sveltekit({...})`); there is no `svelte.config.js`.
- Env vars are declared in `src/env.ts` (`defineEnvVars`) and imported from `$app/env/public` / `$app/env/private`.
- Param matchers are in `src/params.ts` (`defineParams`); `$lib` is replaced by `#lib/...` (package.json `imports`,
  always with the file extension: `#lib/foo.ts`, `#lib/Bar.svelte`).
- `$app/state` only (no `$app/stores`); `goto(url, { replace, shallow, reset: false })` replaces `replaceState` /
  `keepFocus`; hook types come from `@sveltejs/kit/hooks`; `error(status, 'message')`.
- Svelte 5 runes everywhere; `// svelte-ignore state_referenced_locally` is used where a prop is deliberately a
  one-time seed (config constants, initial values).

## Gotchas

- An `$effect` that reads and writes the same `$state` (`x = { ...x, ... }`) loops forever
  (`effect_update_depth_exceeded`): use `untrack` or per-key assignment. `replaceState` from `$app/navigation` does
  not update `page.url`; the admin editor tabs keep their own state (`admin/editor-tab.svelte.ts`).
  `afterNavigate`'s first call for a client-only page has `type: 'enter'` and a non-null `from`.
- Do not concatenate Tailwind classes onto `inputCls` (`class="{inputCls} w-40"`): conflicting utilities lose
  unpredictably. Use `inp('w-40')` (tailwind-merge) from `admin/ui/classes.ts`.
- tiptap packages must all be on one version (a mixed install fails the build with a missing export).
- Admin media: URL is read-only in the editor (the API cascades URL changes to content, but the stored object does not
  move). The library filters live in `admin/media/MediaFilters.svelte` and `browser.svelte.ts`.
- Admin UI tests: serve the production build on :3000 against a mock API (`PUBLIC_API_URL=http://localhost:4000`).
- Deleting files with a recursive-delete idiom in a shell command can be rejected by the tool environment's hook:
  delete files one by one and write docs with the Write tool.
