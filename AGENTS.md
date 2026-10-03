# AGENTS.md — working on @iankibetsh/sh-tailwind

Guidance for AI agents (and humans) changing this library. If you are *using* the
library in an app, read [`llms.txt`](llms.txt) and `documentation/` instead.

## Layout

| Path | What |
|---|---|
| `src/index.js` | public exports — anything not exported here is internal |
| `src/plugin/ShTailwind.js` | plugin: installs sh-core, theme, `formComponents`, popup registry |
| `src/components/{form,table,overlay,navigation,actions}/` | components |
| `src/popups/` | URL popup manager, URL codec, prop coercion |
| `src/theme/` | `defaultTheme`, injection keys, `useTheme` |
| `src/playground/` | dev-only demo app (not shipped) |
| `documentation/*.md` | user guides — **shipped in the npm package** |
| `llms.txt` | agent index of the guides — **shipped in the npm package** |

## Rules

1. **Docs move with code.** Any change to a public prop, event, slot, option, export or
   URL format updates the matching `documentation/*.md` in the same commit. A new
   guide also gets a line in `llms.txt` and the table in `README.md`; a new export
   goes in the list in `documentation/theming.md`. Apps read these docs from
   `node_modules`, so a stale guide is a bug.
2. **Don't break the public API in a patch.** Additive features bump the minor
   (`0.x` → `0.(x+1).0`); fixes bump the patch.
3. **vue-router is optional.** Get it via
   `getCurrentInstance()?.appContext.config.globalProperties.$router` (or the app in
   the plugin), never `import … from 'vue-router'` in library code.
4. **Tailwind classes must be whole literals** (no string-built class names), so
   consumers' `@source` scanning picks them up. The default theme is light-only.
5. No Bootstrap, no Bootstrap JS.

## Develop & verify

```bash
npm install
npm run dev     # playground at http://localhost:5173 (mocks demo/* endpoints)
npm run build   # library build into dist/ — must pass before committing
```

Add a playground demo for new UI behaviour and click through it before committing.

## Release

1. Bump `version` in `package.json` and push to `main`. `.github/workflows/release.yml`
   creates the `vX.Y.Z` tag and GitHub Release. Don't push the tag yourself, or the
   workflow skips the release.
2. `npm publish` is **manual** (no CI publish). `prepublishOnly` runs the build.
3. Then bump dependants (e.g. the `sh-tailwind-laravel` template).
