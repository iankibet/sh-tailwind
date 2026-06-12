# @iankibetsh/sh-tailwind

Vue 3 + Tailwind CSS v4 component library for Laravel backends, built on [`@iankibetsh/sh-core`](https://www.npmjs.com/package/@iankibetsh/sh-core). The Tailwind twin of `@iankibetsh/shframework` (Bootstrap): forms, dialogs, drawers and action components — zero runtime dependencies beyond sh-core peers.

## Components

| Component | Purpose |
|---|---|
| `ShForm` | Schema-driven form: type inference, Laravel 422 validation, multi-step wizard |
| `ShTable` | Server-driven data table with offline-first IndexedDB cache (search/sort/pagination keep working offline) |
| `ShDialog` / `ShDialogBtn` | Tailwind-native modal (Teleport + Transition, no Bootstrap JS) |
| `ShDrawer` / `ShDrawerBtn` | Offcanvas panel from start/end/top/bottom |
| `ShDialogForm` | Trigger button + dialog + form in one |
| `ShConfirmAction` | Swal confirm → POST → toast |
| `ShSilentAction` | Direct GET/POST/PUT/DELETE with toast feedback |
| Inputs | Text, TextArea, Email, Password (show/hide), Number, Date, Select (remote options), Phone (searchable country dropdown, offline emoji flags), ShSuggest (autocomplete, multiple, custom values) |

## Install

```bash
npm i @iankibetsh/sh-tailwind @iankibetsh/sh-core pinia
```

### Tailwind CSS setup

With **`@tailwindcss/vite`** (recommended) the library's classes are picked up automatically from the module graph — no extra config.

With the **PostCSS plugin or CLI**, add an `@source` directive so Tailwind scans the package:

```css
@import "tailwindcss";
@source "../node_modules/@iankibetsh/sh-tailwind";
```

(The path is relative to the CSS file. If components render unstyled, this line is what's missing.)

### Plugin

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ShTailwind } from '@iankibetsh/sh-tailwind'

const app = createApp(App)
app.use(createPinia())
app.use(ShTailwind, {
    // all @iankibetsh/sh-core options pass through:
    baseApiUrl: import.meta.env.VITE_APP_API_URL,
    authMode: 'bearer',            // or 'cookie' (Sanctum SPA)
    sessionTimeout: 400,
    // sh-tailwind options:
    theme: {                       // deep-merged over the default theme
        form: { submitBtn: 'rounded-lg bg-indigo-600 px-4 py-2 text-white ...' }
    },
    formComponents: {              // replace input types globally
        // date: MyFancyDatePicker
    }
})
```

## ShForm

```vue
<ShForm
    action="users"
    :fields="[
        'name',                                            // type inferred (text)
        'email',                                           // inferred email
        { name: 'amount', type: 'number', min: 0 },
        { name: 'role_id', label: 'Role', options: { url: 'roles' } },
        { name: 'tags', type: 'suggest', multiple: true, allowCustom: true, options: [...] },
        { name: 'bio', type: 'textarea', rows: 5, helper: 'Shown publicly' }
    ]"
    :current-data="editingUser"
    success-message="Saved!"
    @success="reload"
/>
```

Field schema: `{ name, type, label, placeholder, helper, required, value, options (array | { url }), multiple, allowCustom, min, max, step, rows, withTime, component, props, countryCode, class }`.

- **Type inference** when `type` is omitted: exact names (`password`, `email`, `phone`, `description`, …) plus suffixes (`*_email`, `*_phone`, `*_at`/`*_date`/`*_on`); fields with `options` become `select` (or `suggest` when `multiple`/`allowCustom`).
- **Validation**: Laravel 422 errors render under each field and clear on focus; with steps, the wizard jumps to the first errored step.
- **Steps**: `:steps="[{ title: 'Account', fields: ['name','email'] }, ...]"` renders a progress indicator and Next/Back navigation.
- **Events**: `success`, `error`, `fieldChanged(name, value, data)`, `preSubmit`.
- Inside a `ShDialog`, a successful submit closes the host dialog automatically (set `retain-on-success` on the dialog, or `retain-dialog` on `ShDialogForm`, to keep it open).

## ShTable

```vue
<ShTable
    endpoint="users"
    :columns="[
        'name',                                       // label inferred
        { name: 'email', label: 'Email Address' },
        { name: 'amount', format: 'money' },          // money | number | date | datetime
        { name: 'owner.name', label: 'Owner' },       // dot paths supported
        { name: 'status', component: StatusBadge }    // custom cell (:row, :value)
    ]"
    :actions="[
        { label: 'Edit', emit: 'edit' },                                  // @edit(row)
        { label: 'View', link: '/users/{id}' },                           // router push
        { label: 'Suspend', url: 'users/{id}/suspend', confirm: 'Sure?' } // swal confirm + POST
    ]"
    :multi-actions="[{ label: 'Archive', handler: rows => archive(rows), permission: 'archive-users' }]"
    searchable
    has-range
    row-link="/users/{id}"
    cache
    @edit="openEditor"
/>
```

Per-column `#cell-<name>="{ row, value }"` slots override any cell. Sends the classic server contract (`page`, `per_page`, `filter_value`, `order_by`, `order_method`, `from`, `to`, `exact`, `paginated`) and expects a Laravel paginator response — existing backends work unchanged.

### Offline-first cache

With `cache` (or the global `enableTableCache` ShCore option):

1. The exact query's last response renders instantly from IndexedDB, then revalidates over the network.
2. Every fetched row is merged into a per-endpoint pool (capped, scoped per user id).
3. If the network is unreachable or slower than `network-timeout` (default 10s), the query — **including search, sort and pagination** — runs locally against the pool and an offline banner is shown. The next successful response clears it.

`clearTableCache()` (exported) wipes everything, e.g. on logout.

## Dialogs & drawers

```vue
<ShDialog v-model:open="open" title="Edit user" size="lg">
    <p>content...</p>
    <template #footer="{ close }">
        <button @click="close()">Done</button>
    </template>
</ShDialog>

<ShDrawer v-model:open="side" position="end" size="md" title="Filters">...</ShDrawer>

<ShDialogBtn title="Quick view"> <template #trigger>Open</template> ... </ShDialogBtn>

<ShDialogForm title="New user" action="users" :fields="['name','email']">
    <template #trigger>Add user</template>
</ShDialogForm>
```

Sizes: `sm | md | lg | xl | full`. `static` disables Escape/backdrop close (backdrop click pulses the panel). Dialogs stack — Escape closes the topmost first. Body scroll is locked while open, and focus returns to the trigger on close.

## Actions

```vue
<ShConfirmAction url="users/9/suspend" title="Suspend user?" message="They lose access immediately" @success="reload">
    Suspend
</ShConfirmAction>

<ShSilentAction url="cache/flush" method="POST" success-message="Cache cleared">Flush cache</ShSilentAction>
```

## Theming

Three layers, most specific wins:

1. Plugin `theme` option — deep-merged over `defaultTheme` (export it to see every key: `form`, `inputs`, `dialog`, `drawer`, `buttons`).
2. Per-component `classes` prop — partial section override.
3. Per-field `class` — appended to that input.

Because overrides are plain class strings written in your app, they're always in Tailwind's scan path.

## Coming from shframework

| shframework (Bootstrap) | sh-tailwind |
|---|---|
| `ShAutoForm` + type arrays (`textAreas`, `phones`, …) | `ShForm` + field objects (`{ name, type }`) |
| `placeHolders` / `labels` / `helperTexts` objects | per-field `placeholder` / `label` / `helper` |
| `fillSelects` | `options: { url }` on the field |
| `ShModal` / `ShModalBtn` / `ShModalForm` | `ShDialog` / `ShDialogBtn` / `ShDialogForm` |
| `ShCanvas` / `ShCanvasBtn` | `ShDrawer` / `ShDrawerBtn` |
| `shFormElementClasses` injection | `theme` plugin option |
| `ShConfirmAction` / `ShSilentAction` | same names, same events (`success`/`failed`/`canceled` + legacy aliases) |
