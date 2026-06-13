# Tabs

[← Back to overview](../README.md)

`ShTabs` is a single, unified tabs component. It replaces shframework's two separate `ShTabs` + `ShDynamicTabs` with one component that supports three content strategies and degrades gracefully when vue-router isn't installed.

| Strategy | When | Content comes from |
|---|---|---|
| **slots** | most cases — you own the markup | `#tab-<key>` named slots (or the default slot) |
| **component** | render a component per tab | each tab's `component`, swapped in place |
| **router** | page-level, deep-linkable tabs | a nested `<router-view>` at `/{base}/tab/{key}` |

Modern niceties throughout: `v-model:tab`, full keyboard navigation (a11y), lazy panels, three visual variants, counts/badges, per-tab icons, `permission`/`validator` filtering.

## Slots (default)

`ShTabs` owns the active state; you provide a `#tab-<key>` slot per tab.

```vue
<ShTabs
    v-model:tab="active"
    :tabs="['overview', { key: 'activity', count: 12 }, { key: 'archived', disabled: true }]"
    variant="pills"
    @change="(key, tab) => console.log('switched to', key)"
>
    <template #tab-overview>…</template>
    <template #tab-activity>…</template>
</ShTabs>
```

A scoped **default slot** `{ tab, active }` is used as the fallback for any tab without a named slot — handy for rendering one body driven by the active tab.

## Components

Give each tab a `component` and `ShTabs` swaps it in place (the old `ShDynamicTabs`). Use `sync="query"` to reflect the active tab in the URL as `?tab=<key>`.

```vue
<ShTabs
    :tabs="[
        { label: 'Profile',  component: ProfileTab },
        { label: 'Security', component: SecurityTab, count: 2 }
    ]"
    sync="query"
/>
```

Extra attributes and `:data` are bound onto the rendered component, so `<ProfileTab :user="user" />` works by spreading attrs.

## Router mode

Set `router` (or a `baseUrl`) and the active tab is driven by the route. `ShTabs` renders the nav as `<router-link>`s pointing at `/{base}/tab/{key}` and a nested `<router-view>` for the panel (the old `ShTabs`). Requires nested routes under the base path.

```vue
<ShTabs :tabs="['pending', 'completed', 'archived']" base-url="/admin/tasks" :counts="{ pending: 3 }" />
```

On mount, if the URL has no `/tab/...` segment it redirects to the first tab. `baseUrl` defaults to the current route path when omitted.

## Tab item shapes

A tab is a **string**, an **object**, or a **function** (called with `data`):

```ts
'pending'                          // → { key: 'pending', label: 'Pending' }
(data) => ({ key, label, ... })    // computed from :data

{
  key,          // unique id (defaults to `name`, or a slug of `label`)
  label,        // defaults to startCase(key)
  component,    // component mode: rendered when active
  icon,         // component rendered before the label
  count,        // number bubble (aliases: counts, badge); 0 still renders
  permission,   // hidden unless userStore.isAllowedTo(permission)
  validator,    // (data) => boolean; hidden when it returns false
  disabled,     // not selectable; skipped by keyboard nav
  class         // extra classes on this tab button/link
}
```

If every tab is filtered out by `permission`/`validator`, `ShTabs` shows the `forbiddenMessage` ("403 — not allowed"); with no tabs at all it shows `emptyMessage`.

## Counts

Three sources, most specific wins: a fetched API map > the `counts` prop > the tab's own `count`/`counts`/`badge`.

```vue
<!-- per-tab -->
:tabs="[{ key: 'inbox', count: 5 }]"
<!-- shared object map -->
:counts="{ inbox: 5, archived: 0 }"
<!-- API endpoint string — fetched on mount, expects { key: n } -->
counts="messages/tab-counts"
```

## Props

| Prop | Default | Notes |
|---|---|---|
| `tabs` | — (required) | array of strings / objects / functions |
| `modelValue` (`v-model:tab`) | `null` | active tab key; null = `ShTabs` owns it |
| `data` | `{}` | passed to tab functions / `validator`, bound to content |
| `counts` | `null` | object map `{ key: n }` **or** an API endpoint string |
| `variant` | `'underline'` | `underline` \| `pills` \| `boxed` |
| `sync` | `'none'` | `'query'` reflects the active tab as `?tab=<key>` |
| `queryKey` | `'tab'` | query-param name for `sync="query"` |
| `router` | `false` | force router mode (auto-on when `baseUrl` set) |
| `baseUrl` | `null` | base path for router-mode links |
| `lazy` | `false` | mount a panel only the first time it becomes active |
| `emptyMessage` | `'No tabs available'` | shown when there are no tabs |
| `forbiddenMessage` | `'403 — not allowed'` | shown when all tabs are filtered out |
| `classes` | `null` | per-instance override of the `tabs` theme section |

**Events:** `update:modelValue(key)` (for `v-model:tab`), `change(key, tab)`.
**Exposes:** `active` (ref of the current key), `select(tab)`.

## Accessibility & keyboard

The nav is a `role="tablist"` with `role="tab"` items and a roving `tabindex`. With a tab focused:

| Key | Action |
|---|---|
| `←` / `→` / `↑` / `↓` | move to the previous / next tab (wraps, skips `disabled`) |
| `Home` / `End` | jump to the first / last enabled tab |

Inline panels stay mounted and toggle with `v-show`, so form state and scroll position survive tab switches; combine with `lazy` to defer mounting heavy panels until first viewed.

## Variants

`variant` selects a preset block from the `tabs` theme section — `underline` (default), `pills`, `boxed`. Override any of them (or the `count`/`panel`/`nav` tokens) via the plugin `theme` or the per-instance `classes` prop. See [Theming](theming.md).

## Coming from shframework

| shframework | sh-tailwind |
|---|---|
| `ShTabs` (router, `base-url`, `tab-counts`) | `ShTabs` with `base-url` / `:counts` (router mode) |
| `ShDynamicTabs` (`:tabs` with `component`, `addTabQuery`) | `ShTabs` with `component` tabs + `sync="query"` |
| `currentTab="Tab Two"` | `v-model:tab="key"` |
| `validator` / `permission` on tabs | same keys, unchanged |
