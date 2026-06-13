# Table

[← Back to overview](../README.md)

`ShTable` is a server-driven data table with an offline-first IndexedDB cache — search, sort and pagination all work offline.

## Example

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

## Action handlers

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

## Props

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

## Column / action schema

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

## Offline-first cache

With `cache` (or the global `enableTableCache`):

1. The exact query's last response renders instantly from IndexedDB, then revalidates over the network.
2. Every fetched row is merged into a per-endpoint pool (capped at 3000, scoped per user id).
3. If the network is unreachable or slower than `network-timeout`, the query — **including search, sort and pagination** — runs locally against the pool and an amber offline banner shows. The next successful response clears it.

Helpers are exported for custom tables: `useTableData({ query, cacheEnabled, networkTimeout })`, `localQuery(rows, opts)`, and `clearTableCache()` (call on logout).
