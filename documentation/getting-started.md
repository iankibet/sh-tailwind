# Getting started

[← Back to overview](../README.md)

Install, Tailwind setup, and the plugin that wires everything together.

## Install

```bash
npm i @iankibetsh/sh-tailwind @iankibetsh/sh-core pinia
```

Peers: `@iankibetsh/sh-core@^1`, `vue@^3.5`, `pinia@^3`, and `vue-router@^4||^5` (optional — only needed for `ShTable` row links / `link:` actions and `ShTabs` router mode).

## Tailwind CSS setup

With **`@tailwindcss/vite`** the library's classes are picked up automatically from the module graph — no extra config.

With the **PostCSS plugin or CLI**, add an `@source` directive so Tailwind scans the package:

```css
@import "tailwindcss";
@source "../node_modules/@iankibetsh/sh-tailwind";
```

The path is relative to the CSS file. **If components render unstyled, this line is what's missing.** The package ships its `src/` for exactly this reason.

The default theme is **light only** — it never emits `dark:` variants, so it won't fight your app's theme. Dark mode is opt-in via [theming](theming.md).

## Plugin

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ShTailwind } from '@iankibetsh/sh-tailwind'

const app = createApp(App)
app.use(createPinia())
app.use(ShTailwind, {
    // every @iankibetsh/sh-core option passes through (API client, auth, session):
    baseApiUrl: import.meta.env.VITE_APP_API_URL,
    authMode: 'bearer',            // or 'cookie' (Laravel Sanctum SPA)
    sessionTimeout: 400,
    enableTableCache: true,        // default cache flag for ShTable

    // sh-tailwind options:
    theme: { form: { submitBtn: 'rounded-lg bg-indigo-600 px-4 py-2 text-white ...' } },
    formComponents: { /* date: MyDatePicker */ }   // replace input types globally
})
```

`createShTailwind(options)` is also exported (returns an installable plugin object). Installing the plugin also wires sh-core's API client, the `v-if-user-can` directive and auth-endpoint provides.

## Next steps

- [Forms](forms.md) — schema-driven `ShForm`
- [Inputs & masks](inputs.md) — standalone inputs, masks, PIN
- [Table](table.md) — server-driven `ShTable` with offline cache
- [Tabs](tabs.md) — `ShTabs`
- [Overlays](overlays.md) — dialogs & drawers
- [Actions](actions.md) — confirm / silent action buttons
- [Theming](theming.md) — the three override layers
