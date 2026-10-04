# Theming

[← Back to overview](../README.md)

Pick a base, then override:

0. **Plugin `preset`** — replaces the light-only `defaultTheme`. Use [`tokenTheme`](#tokens-brand-colour-and-dark-mode) for one-variable brand colours and dark mode.
1. **Plugin `theme`** — deep-merged over the preset (or `defaultTheme`). Sections: `form` (incl. `steps`), `inputs` (`select`, `pin`, `phone`, `suggest`, password toggle), `dialog`, `drawer`, `table` (incl. `pagination`), `tabs` (incl. `pills` / `boxed` variants), `buttons`. Import `defaultTheme` to see every key.
2. **Per-component `classes` prop** — overrides one section for that instance.
3. **Per-field `class`** — appended to that input.

```js
app.use(ShTailwind, { theme: { buttons: { primary: 'rounded-full bg-black px-5 py-2 text-white' } } })
```

Because overrides are plain class strings written in your app, they're always in Tailwind's scan path. `defaultTheme` is intentionally light-only; for dark mode use the token preset below. `formComponents` swaps whole input components by type; `useTheme(section, overrides)` resolves a section in custom components.

## Tokens, brand colour and dark mode

`tokens.css` defines design tokens as Tailwind v4 colours backed by CSS variables, and `tokenTheme` is the full theme rewritten on them. Import both and every component follows your brand colour and the light/dark mode:

```css
/* app.css */
@import 'tailwindcss';
@import '@iankibetsh/sh-tailwind/tokens.css';
@source '../node_modules/@iankibetsh/sh-tailwind';
```

```js
import { ShTailwind, tokenTheme } from '@iankibetsh/sh-tailwind'
app.use(ShTailwind, { preset: tokenTheme, theme: { /* optional tweaks */ } })
```

**Brand.** Set one hex and all shades derive from it (`color-mix`), in both modes:

```css
:root { --sh-primary: #0b8265; --sh-secondary: #7c3aed; }
```

`--sh-on-primary` / `--sh-on-secondary` (default white) set the text colour drawn on top; switch to a dark value for very light brand colours. The variables can come from server config (e.g. an inline `<style>` in your HTML), so a colour change needs no rebuild.

**Utilities** for your own markup (work in both modes):

| Utility | Use |
|---|---|
| `bg-canvas` | page background |
| `bg-surface` | cards, panels, inputs |
| `bg-muted` | subtle fills: hover rows, table head, wells |
| `border-line` / `border-line-strong` | dividers / input borders (`divide-line` too) |
| `text-fg` / `text-fg-muted` / `text-fg-subtle` | primary / secondary / tertiary text |
| `bg-primary` + `text-on-primary`, `hover:bg-primary-hover` | primary buttons |
| `bg-primary-soft` + `text-primary-strong` | selected rows, badges, icon wells |
| `text-primary`, `ring-primary/30`, `border-primary` | links, focus rings |
| `secondary`, `secondary-soft`, `secondary-strong`, `on-secondary` | the same for the secondary colour |

For status colours use alpha fills so they read in both modes: `bg-red-500/10 text-red-700 dark:text-red-300`.

**Dark mode.** `tokens.css` makes Tailwind's `dark:` variant follow a `dark` class on `<html>`. `useColorMode()` manages it:

```js
import { useColorMode } from '@iankibetsh/sh-tailwind'
const { mode, resolved, setMode, toggle } = useColorMode()
setMode('dark')   // 'light' | 'dark' | 'system' (follows the OS); remembered in localStorage
```

To avoid a light flash before Vue boots, put this in your HTML `<head>`:

```html
<script>
    try {
        const m = localStorage.getItem('sh-color-mode') || 'system';
        if (m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    } catch (e) {}
</script>
```

## Every value is a full utility string

Theme values are **complete** Tailwind utility strings, never interpolated fragments — so consumers' `@source` extraction always finds the classes. When overriding, write the whole string for that key (e.g. an active tab), not a partial.

## Exports

```js
// plugin & theme
ShTailwind, createShTailwind, defaultTheme, useTheme,
SH_TW_THEME, SH_TW_COMPONENTS, SH_DIALOG_CONTEXT, SH_TW_POPUPS, SH_POPUP_CONTEXT
tokenTheme, useColorMode, COLOR_MODE_STORAGE_KEY   // + '@iankibetsh/sh-tailwind/tokens.css'
// form
ShForm, ShFormSteps
// navigation
ShTabs
// overlays
ShDialog, ShDrawer, ShDialogBtn, ShDrawerBtn, ShDialogForm, useDialog
// popups
ShPopups, ShPopupLink, ShPopupForm, usePopups, usePopupContext
// table
ShTable, ShTablePagination, useTableData, localQuery, shTableCache, clearTableCache
// actions
ShConfirmAction, ShSilentAction, ShSpinner
// inputs
TextInput, TextAreaInput, EmailInput, PasswordInput, PinInput, MaskedInput,
NumberInput, DateInput, SelectInput, PhoneInput, FileInput, ShSuggest
// utilities & data
applyMask, maskMoney, maskPattern, countries
```

From `@iankibetsh/sh-tailwind/vite` (build-time, see [Routing](routing.md)):

```js
shPages, pageMeta, routeName, createPageDefaults, liftPageMeta
```
