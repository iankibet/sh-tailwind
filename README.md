# @iankibetsh/sh-tailwind

Vue 3 + Tailwind CSS v4 component library for Laravel backends, built on [`@iankibetsh/sh-core`](https://www.npmjs.com/package/@iankibetsh/sh-core). The Tailwind twin of `@iankibetsh/shframework` (Bootstrap): schema-driven forms, a server-driven data table with an offline cache, Tailwind-native dialogs/drawers, and confirm/silent action buttons — **zero runtime dependencies** beyond its peers.

- [Install & setup](#install)
- [ShForm](#shform) · [Inputs & masks](#inputs--masks) · [PIN](#pin-input)
- [ShTable](#shtable) (+ [offline cache](#offline-first-cache))
- [Dialogs & drawers](#dialogs--drawers)
- [Actions](#actions)
- [Theming](#theming)
- [Exports](#exports) · [Migrating from shframework](#coming-from-shframework)

## Components at a glance

| Component | Purpose |
|---|---|
| `ShForm` | Schema-driven form: type inference, input masks, Laravel 422 validation, multi-step wizard |
| `ShTable` / `ShTablePagination` | Server-driven table with offline-first IndexedDB cache (search/sort/pagination work offline) |
| `ShDialog` / `ShDialogBtn` / `ShDialogForm` | Tailwind-native modal (Teleport + Transition, no Bootstrap JS) |
| `ShDrawer` / `ShDrawerBtn` | Slide-over panel from start/end/top/bottom |
| `ShConfirmAction` / `ShSilentAction` | Action buttons (confirm→POST→toast / direct request→toast) |
| `ShSpinner` | The `animate-spin` SVG used internally |
| Inputs | Text, TextArea, Email, Password (show/hide), **Pin** (segmented), **Masked** (money/pattern), Number, Date, Select (remote), Phone (searchable, offline flags), ShSuggest (autocomplete) |

## Install

```bash
npm i @iankibetsh/sh-tailwind @iankibetsh/sh-core pinia
```

Peers: `@iankibetsh/sh-core@^1`, `vue@^3.5`, `pinia@^3`, and `vue-router@^4||^5` (optional — only needed for `ShTable` row links / `link:` actions).

### Tailwind CSS setup

With **`@tailwindcss/vite`** the library's classes are picked up automatically from the module graph — no extra config.

With the **PostCSS plugin or CLI**, add an `@source` directive so Tailwind scans the package:

```css
@import "tailwindcss";
@source "../node_modules/@iankibetsh/sh-tailwind";
```

The path is relative to the CSS file. **If components render unstyled, this line is what's missing.** The package ships its `src/` for exactly this reason.

The default theme is **light only** — it never emits `dark:` variants, so it won't fight your app's theme. Dark mode is opt-in via the [theme](#theming) option.

### Plugin

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

## ShForm

```vue
<ShForm
    action="users"
    method="post"
    :fields="[
        'name',                                                 // type inferred → text
        'email',                                                // inferred → email
        { name: 'amount', mask: 'money' },                      // auto-formatted
        { name: 'role_id', label: 'Role', options: { url: 'roles' } },
        { name: 'tags', type: 'suggest', multiple: true, options: [...] },
        { name: 'bio', type: 'textarea', rows: 5, helper: 'Shown publicly' }
    ]"
    :current-data="editingUser"
    success-message="Saved!"
    @success="reload"
/>
```

### Props

| Prop | Default | Notes |
|---|---|---|
| `action` | — (required) | endpoint |
| `method` | `'post'` | `post` \| `put` \| `patch` \| `delete` |
| `fields` | — (required) | array of strings or [field objects](#field-schema) |
| `currentData` | — | prefill for edit flows (seeds values, adds hidden `id`) |
| `steps` | — | `[{ title, fields: ['name', ...] }]` → wizard |
| `submitLabel` | `'Submit'` | submit button text |
| `successMessage` | — | toast on success |
| `retainData` | `false` | keep values after a successful submit |
| `preSubmit` | — | `(data) => false` aborts, an object replaces the payload, else proceeds |
| `hiddenId` | `true` | auto-append a hidden `id` when `currentData.id` exists |
| `disabled` | `false` | disable the whole form |
| `classes` | — | per-instance override of the `form` theme section |

**Events:** `success(data)`, `error(reason)`, `fieldChanged(name, value, data)`, `preSubmit(data)` — plus legacy aliases `formSubmitted` / `formError`.

### Field schema

```ts
{
  name,                 // required (string shorthand → { name })
  type,                 // omitted → inferred (see below)
  label,                // default startCase(name); false hides it
  placeholder, helper,  // helper renders as html under the field
  required,             // shows a * marker (server still validates)
  value,                // initial value (else from currentData[name])
  options,              // array | { url }  → select/suggest data
  multiple, allowCustom,// suggest behaviour
  optionTemplate,       // component to render each suggest option
  min, max, step,       // number / date
  rows,                 // textarea
  withTime,             // date → datetime-local
  mask,                 // input mask (see Inputs & masks)
  digits, secret,       // pin: box count / dot-mask
  countryCode, detectCountry, // phone
  component,            // use a custom component for this field
  props,                // extra props v-bound onto the input
  class                 // extra classes appended to the input
}
```

**Type inference** (when `type` is omitted): exact names (`password`, `email`, `phone`, `pin`, `description`, …), suffixes (`*_email`, `*_phone`, `*_at`/`*_date`/`*_on`), and `options` present → `select` (or `suggest` with `multiple`/`allowCustom`).

**Validation:** Laravel `422` errors (`reason.response.data.errors`) render under each field and clear on focus; in a wizard the form jumps to the first step containing an error.

**Inside a dialog:** a successful submit auto-closes the host `ShDialog` (set `retain-on-success` on the dialog, or `retain-dialog` on `ShDialogForm`, to keep it open).

## Inputs & masks

Every input is standalone-usable with a `v-model` contract (`modelValue` + `update:modelValue`, and a `clearValidationErrors` emit used by ShForm). Override any type globally with the plugin's `formComponents`, or per-field with `component`.

### Input masks

Set `mask` on a field (or use `MaskedInput` directly) to auto-format as the user types:

| `mask` | Display | v-model receives |
|---|---|---|
| `'money'` | `1,234,567.89` | raw number `1234567.89` |
| `'integer'` | `1,234,567` | `1234567` |
| `{ type: 'money', prefix: 'KES ', decimals: 0 }` | `KES 50,000` | `50000` |
| `'#### #### #### ####'` | `4111 1111 1111 1111` | formatted string |
| `{ pattern: '#### ####', unmask: true }` | `1234 5678` | `12345678` (stripped) |
| `(value) => value.toUpperCase()` | `ABC` | `ABC` |

Pattern tokens: `#` digit, `A` letter, `N`/`*` alphanumeric; any other character is a literal. Money masks emit the **raw number** (clean for the backend); pattern masks emit the formatted string unless `unmask: true`.

```vue
<MaskedInput v-model="amount" mask="money" />
<MaskedInput v-model="card" mask="#### #### #### ####" />
```

`applyMask(value, mask)`, `maskMoney(raw, opts)` and `maskPattern(raw, pattern, opts)` are exported if you need them outside a form.

### PIN input

`type: 'pin'` (or the standalone `PinInput`) renders segmented digit boxes — auto-advance, backspace-to-previous, arrow nav, and paste-distributes-a-code.

```vue
<!-- in a form -->
{ name: 'otp', type: 'pin', digits: 6 }
{ name: 'wallet_pin', type: 'pin', digits: 4, secret: true }

<!-- standalone -->
<PinInput v-model="otp" :length="6" />
<PinInput v-model="pin" :length="4" secret />
```

Props: `length` (default 4), `secret` (mask as dots), `isInvalid`, `disabled`. Emits `update:modelValue`, `complete(value)` when all boxes are filled, and `clearValidationErrors`.

### Other inputs

| Component | Key props |
|---|---|
| `PhoneInput` | `countryCode` (default `'KE'`), `detectCountry` (opt-in `sh-country-code` lookup). Searchable country dropdown, **offline emoji flags** — no assets, no native select |
| `SelectInput` | `options` (array) **or** `url` (fetched with `{ all: 1 }`); coerces `{ id, label }` from loose shapes |
| `ShSuggest` | `options`/`url`, `multiple`, `allowCustom`, `optionTemplate`; debounced remote search, badges, keyboard nav |
| `PasswordInput` | show/hide eye toggle, `autocomplete` |
| `DateInput` | `withTime` → `datetime-local`, `min`, `max` |
| `NumberInput` | `min`, `max`, `step` |
| `TextInput` / `TextAreaInput` / `EmailInput` | `rows` (textarea) |

## ShTable

```vue
<ShTable
    endpoint="users"
    :columns="[
        'name',                                       // label inferred
        { name: 'email', label: 'Email Address' },
        { name: 'amount', format: 'money' },          // money | number | date | datetime
        { name: 'owner.name', label: 'Owner' },       // dot paths
        { name: 'status', component: StatusBadge }    // custom cell (:row, :value)
    ]"
    :actions="[
        { label: 'Edit', handler: row => (editing = row) },               // direct callback (no @event)
        { label: 'View', link: '/users/{id}' },                           // router push / location
        { label: 'Suspend', url: 'users/{id}/suspend', confirm: 'Sure?' }, // swal confirm → POST → reload
        { label: 'Promote', emit: 'promote' }                             // → @promote(row), if you prefer events
    ]"
    :multi-actions="[{ label: 'Archive', handler: rows => archive(rows), permission: 'archive-users' }]"
    searchable has-range cache
    row-link="/users/{id}"
    @promote="onPromote"
/>
```

### Action handlers

An action runs the **first** matching key, so you pick the style per action:

| Key | Behaviour |
|---|---|
| `handler: (row) => {}` | **call your callback directly** — close over component state, mutate, then `table.reload()` via a ref |
| `emit: 'name'` | emits `@name(row)` (and a generic `@action('name', row)`) |
| `link: '/x/{id}'` | router push (or `location` without vue-router); `{id}` filled from the row |
| `url: 'x/{id}'` | POST (optionally behind `confirm: 'msg'`), toast the result, reload |

```js
const userActions = [
  { label: 'View',    handler: (row) => openProfile(row) },
  { label: 'Promote', handler: (row) => { row.role = 'Manager'; table.value.reload() } },
  { label: 'Delete',  class: 'text-red-600', handler: (row) => removeUser(row) }
]
// multi-actions get the selected rows array:
const bulk = [{ label: 'Email selected', handler: (rows) => emailAll(rows) }]
```

### Props

| Prop | Default | Notes |
|---|---|---|
| `endpoint` | — (required) | data endpoint |
| `columns` | — (required) | [column schema](#column--action-schema) |
| `actions` | `[]` | row actions |
| `multiActions` | `[]` | bulk actions over selected rows (adds checkboxes + a floating bar) |
| `searchable` | `true` | debounced search box with an Exact toggle |
| `searchPlaceholder` | `'Search'` | |
| `hasRange` | `false` | from/to date filters |
| `perPage` | ShConfig `tablePerPage` (10) | persisted per table |
| `sortBy` / `sortMethod` | — / `'desc'` | initial sort |
| `paginationStyle` | ShConfig `tablePaginationStyle` | `'pages'` \| `'loadMore'` |
| `rowLink` | — | `'/users/{id}'` — whole row navigates |
| `cache` | `null` → ShConfig `enableTableCache` | offline cache (see below) |
| `networkTimeout` | `10000` | ms before falling back to cache |
| `reload` | — | change the value to force a reload |
| `emptyMessage` | `'No records found'` | |
| `classes` | — | override the `table` theme section |

**Events:** `rowClick(row)`, `loaded(response)`, `action(name, row)`, plus each action's own `emit` name. **Slots:** `#cell-<name>="{ row, value, index }"`, `#actions="{ row }"`, `#empty`. **Exposes:** `reload()`, `records`.

### Column / action schema

```ts
// column
{ name, label, format: 'money'|'number'|'date'|'datetime', sortable, component, show: () => bool, class }
// action
{ label, emit, handler: (row)=>{}, link: '/x/{id}', url: 'x/{id}', confirm: 'msg',
  data, permission, show: (row)=>bool, class, failMessage }
// multi-action
{ label, handler: (rows)=>{}, permission, class }
```

The table sends the classic server contract — `page`, `per_page`, `filter_value`, `order_by`, `order_method`, `from`, `to`, `exact`, `paginated` — and expects a Laravel paginator response, so existing backends work unchanged.

### Offline-first cache

With `cache` (or the global `enableTableCache`):

1. The exact query's last response renders instantly from IndexedDB, then revalidates over the network.
2. Every fetched row is merged into a per-endpoint pool (capped at 3000, scoped per user id).
3. If the network is unreachable or slower than `network-timeout`, the query — **including search, sort and pagination** — runs locally against the pool and an amber offline banner shows. The next successful response clears it.

Helpers are exported for custom tables: `useTableData({ query, cacheEnabled, networkTimeout })`, `localQuery(rows, opts)`, and `clearTableCache()` (call on logout).

## Dialogs & drawers

```vue
<ShDialog v-model:open="open" title="Edit user" size="lg">
    <p>content…</p>
    <template #footer="{ close }"><button @click="close()">Done</button></template>
</ShDialog>

<ShDrawer v-model:open="side" position="end" size="md" title="Filters">…</ShDrawer>

<ShDialogBtn title="Quick view"><template #trigger>Open</template> … </ShDialogBtn>

<ShDialogForm title="New user" action="users" :fields="['name','email']">
    <template #trigger>Add user</template>
</ShDialogForm>
```

**ShDialog props:** `open` (v-model), `title` (or `#title` slot), `size` (`sm|md|lg|xl|full`, default `md`), `static` (disables Escape/backdrop close — backdrop click pulses the panel), `hideClose`, `retainOnSuccess`, `classes`. **Events:** `update:open`, `opened`, `closed`. **Exposes:** `show()`, `close()`. Slots: default (`{ close }`), `#title`, `#footer="{ close }"`.

**ShDrawer** adds `position` (`start|end|top|bottom`, default `end`); same size/static/events/slots.

**ShDialogBtn / ShDrawerBtn** render a trigger button + the overlay; props add `btnClass` and a `#trigger` slot. **ShDialogForm** = trigger + dialog + `ShForm` (all ShForm props pass through), re-keys the form on `currentData`, auto-closes ~600ms after success unless `retain-dialog`.

Dialogs stack — Escape closes the topmost first; body scroll locks while open; focus returns to the trigger on close. The low-level `useDialog({ isStatic, onOpen, onClose })` → `{ isOpen, zIndex, show, close, onBackdrop }` is exported if you're building your own overlay.

## Actions

```vue
<ShConfirmAction url="users/9/suspend" title="Suspend user?" message="They lose access immediately" @success="reload">
    Suspend
</ShConfirmAction>

<ShSilentAction url="cache/flush" method="POST" success-message="Cache cleared">Flush cache</ShSilentAction>
```

- **ShConfirmAction** — swal confirm → POST → toast. Props: `url`, `data`, `title`, `message`, `loadingMessage`, `successMessage`, `failMessage`, `tag` (default `button`), `btnClass`. Events: `success` / `failed` / `canceled` (+ `actionSuccessful` / `actionFailed` / `actionCanceled` aliases).
- **ShSilentAction** — direct request, no confirm. Adds `method` (`GET|POST|PUT|DELETE`) and `disableSuccessMessage`.

## Theming

Three layers, most specific wins:

1. **Plugin `theme`** — deep-merged over `defaultTheme`. Sections: `form` (incl. `steps`), `inputs` (`select`, `pin`, `phone`, `suggest`, password toggle), `dialog`, `drawer`, `table` (incl. `pagination`), `buttons`. Import `defaultTheme` to see every key.
2. **Per-component `classes` prop** — overrides one section for that instance.
3. **Per-field `class`** — appended to that input.

```js
app.use(ShTailwind, { theme: { buttons: { primary: 'rounded-full bg-black px-5 py-2 text-white' } } })
```

Because overrides are plain class strings written in your app, they're always in Tailwind's scan path. For dark mode, supply dark-aware class strings here (the defaults are intentionally light-only). `formComponents` swaps whole input components by type; `useTheme(section, overrides)` resolves a section in custom components.

## Exports

```js
// plugin & theme
ShTailwind, createShTailwind, defaultTheme, useTheme,
SH_TW_THEME, SH_TW_COMPONENTS, SH_DIALOG_CONTEXT
// form
ShForm, ShFormSteps
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

## Coming from shframework

| shframework (Bootstrap) | sh-tailwind |
|---|---|
| `ShAutoForm` + type arrays (`textAreas`, `phones`, …) | `ShForm` + field objects (`{ name, type }`) |
| `placeHolders` / `labels` / `helperTexts` objects | per-field `placeholder` / `label` / `helper` |
| `fillSelects` | `options: { url }` on the field |
| `ShTable` (Bootstrap, prop-heavy) | `ShTable` — `columns`/`actions` objects + offline cache |
| `ShModal` / `ShModalBtn` / `ShModalForm` | `ShDialog` / `ShDialogBtn` / `ShDialogForm` |
| `ShCanvas` / `ShCanvasBtn` | `ShDrawer` / `ShDrawerBtn` |
| `shFormElementClasses` injection | `theme` plugin option |
| `ShConfirmAction` / `ShSilentAction` | same names, same events (+ legacy aliases) |

Both layer on the same `@iankibetsh/sh-core`, so auth, the API client, streamline and `useUserStore` behave identically — only the UI differs.
