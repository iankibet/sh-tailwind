# @iankibetsh/sh-tailwind

Vue 3 + Tailwind CSS v4 component library for Laravel backends, built on [`@iankibetsh/sh-core`](https://www.npmjs.com/package/@iankibetsh/sh-core). The Tailwind twin of `@iankibetsh/shframework` (Bootstrap): schema-driven forms, a server-driven data table with an offline cache, Tailwind-native dialogs/drawers, tabs, and confirm/silent action buttons — **zero runtime dependencies** beyond its peers.

## Documentation

Each module has its own guide under [`documentation/`](documentation/):

| Module | What it covers |
|---|---|
| [Getting started](documentation/getting-started.md) | Install, Tailwind `@source`, the plugin |
| [Forms](documentation/forms.md) | `ShForm` — schema, type inference, validation, wizard |
| [Inputs & masks](documentation/inputs.md) | Standalone inputs, money/pattern masks, PIN |
| [Table](documentation/table.md) | `ShTable` — actions, columns, offline-first cache |
| [Tabs](documentation/tabs.md) | `ShTabs` — slot / component / router modes |
| [Overlays](documentation/overlays.md) | `ShDialog` / `ShDrawer` and trigger/form helpers |
| [Popups](documentation/popups.md) | `ShPopups` — URL-driven, stackable dialogs/drawers (refresh, links, Back) |
| [Routing](documentation/routing.md) | `shPages()` — Vite plugin: pages folder to routes, group folders, default meta |
| [Actions](documentation/actions.md) | `ShConfirmAction` / `ShSilentAction` |
| [Theming](documentation/theming.md) | Token preset (brand colour + dark mode), override layers, full export list |

These guides ship in the npm package, so they always match the installed version: `node_modules/@iankibetsh/sh-tailwind/documentation/`. **AI agents:** start at [`llms.txt`](llms.txt) (also shipped), which indexes every guide.

## Install

```bash
npm i @iankibetsh/sh-tailwind @iankibetsh/sh-core pinia
```

Peers: `@iankibetsh/sh-core@^1`, `vue@^3.5`, `pinia@^3`, and `vue-router@^4||^5` (optional; [file-based routing](documentation/routing.md) needs 5). Register the plugin, then point Tailwind at the package — full steps in [Getting started](documentation/getting-started.md).

```js
import { ShTailwind } from '@iankibetsh/sh-tailwind'
app.use(ShTailwind, { baseApiUrl: import.meta.env.VITE_APP_API_URL, authMode: 'bearer' })
```

## Components at a glance

A small taste of each — follow the doc link for the full API.

### [Forms](documentation/forms.md)

```vue
<ShForm action="users" :fields="['name', 'email', { name: 'amount', mask: 'money' }]" success-message="Saved!" />
```

### [Inputs & masks](documentation/inputs.md)

```vue
<MaskedInput v-model="amount" mask="money" />
<PinInput v-model="otp" :length="6" />
```

### [Table](documentation/table.md)

```vue
<ShTable
    endpoint="users"
    :columns="['name', { name: 'amount', format: 'money' }]"
    :actions="[{ label: 'Edit', handler: row => (editing = row) }]"
    searchable cache
/>
```

### [Tabs](documentation/tabs.md)

```vue
<ShTabs v-model:tab="active" :tabs="['overview', { key: 'activity', count: 12 }]" variant="pills">
    <template #tab-overview>…</template>
    <template #tab-activity>…</template>
</ShTabs>
```

### [Overlays](documentation/overlays.md)

```vue
<ShDialog v-model:open="open" title="Edit user" size="lg">…</ShDialog>
<ShDrawer v-model:open="side" position="end" title="Filters">…</ShDrawer>
```

### [Popups](documentation/popups.md)

```vue
<ShPopups />  <!-- once, in App.vue; register components via the plugin's `popups` option -->
<ShPopupLink comp="ViewTask" type="drawer" :props="{ id: task.id }">View</ShPopupLink>
<!-- or /tasks?popup=drawer&comp=ViewTask&id=5 -->
```

### [Actions](documentation/actions.md)

```vue
<ShConfirmAction url="users/9/suspend" title="Suspend user?" @success="reload">Suspend</ShConfirmAction>
```

## Coming from shframework

| shframework (Bootstrap) | sh-tailwind |
|---|---|
| `ShAutoForm` + type arrays (`textAreas`, `phones`, …) | `ShForm` + field objects (`{ name, type }`) |
| `placeHolders` / `labels` / `helperTexts` objects | per-field `placeholder` / `label` / `helper` |
| `fillSelects` | `options: { url }` on the field |
| `ShTable` (Bootstrap, prop-heavy) | `ShTable` — `columns`/`actions` objects + offline cache |
| `ShTabs` + `ShDynamicTabs` | one `ShTabs` (slot / component / router modes) |
| `ShModal` / `ShModalBtn` / `ShModalForm` | `ShDialog` / `ShDialogBtn` / `ShDialogForm` |
| `ShCanvas` / `ShCanvasBtn` | `ShDrawer` / `ShDrawerBtn` |
| `shFormElementClasses` injection | `theme` plugin option |
| `ShConfirmAction` / `ShSilentAction` | same names, same events (+ legacy aliases) |

Both layer on the same `@iankibetsh/sh-core`, so auth, the API client, streamline and `useUserStore` behave identically — only the UI differs.
