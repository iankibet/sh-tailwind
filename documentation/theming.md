# Theming

[← Back to overview](../README.md)

Three layers, most specific wins:

1. **Plugin `theme`** — deep-merged over `defaultTheme`. Sections: `form` (incl. `steps`), `inputs` (`select`, `pin`, `phone`, `suggest`, password toggle), `dialog`, `drawer`, `table` (incl. `pagination`), `tabs` (incl. `pills` / `boxed` variants), `buttons`. Import `defaultTheme` to see every key.
2. **Per-component `classes` prop** — overrides one section for that instance.
3. **Per-field `class`** — appended to that input.

```js
app.use(ShTailwind, { theme: { buttons: { primary: 'rounded-full bg-black px-5 py-2 text-white' } } })
```

Because overrides are plain class strings written in your app, they're always in Tailwind's scan path. For dark mode, supply dark-aware class strings here (the defaults are intentionally light-only). `formComponents` swaps whole input components by type; `useTheme(section, overrides)` resolves a section in custom components.

## Every value is a full utility string

Theme values are **complete** Tailwind utility strings, never interpolated fragments — so consumers' `@source` extraction always finds the classes. When overriding, write the whole string for that key (e.g. an active tab), not a partial.

## Exports

```js
// plugin & theme
ShTailwind, createShTailwind, defaultTheme, useTheme,
SH_TW_THEME, SH_TW_COMPONENTS, SH_DIALOG_CONTEXT
// form
ShForm, ShFormSteps
// navigation
ShTabs
// overlays
ShDialog, ShDrawer, ShDialogBtn, ShDrawerBtn, ShDialogForm, useDialog
// table
ShTable, ShTablePagination, useTableData, localQuery, shTableCache, clearTableCache
// actions
ShConfirmAction, ShSilentAction, ShSpinner
// inputs
TextInput, TextAreaInput, EmailInput, PasswordInput, PinInput, MaskedInput,
NumberInput, DateInput, SelectInput, PhoneInput, ShSuggest
// utilities & data
applyMask, maskMoney, maskPattern, countries
```
