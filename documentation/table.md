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
| `popup: 'ViewUser'` or `{ comp, type, title: '{name}', size, side, static, props: row => ({}), reload }` | opens a [URL popup](popups.md) with `{ id: row.id }` as props by default; reloads the table when it closes after a form success |

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
| `params` | `{}` | extra query params merged into every request (e.g. `{ status: 'active' }`). Changing it (deep-watched) resets to page 1 and reloads. Reserved keys below always win. Must be a plain object: to send a list, key it (`{ ids: [1, 3] }` → `ids[]=1&ids[]=3`) |
| `columns` | — (required) | [column schema](#column--action-schema) |
| `actions` | `[]` | row actions |
| `multiActions` | `[]` | bulk actions over selected rows (adds checkboxes + a floating bar) |
| `searchable` | `true` | search box (500 ms debounce); an Exact toggle appears after 2+ characters |
| `searchPlaceholder` | `'Search'` | |
| `hasRange` | `false` | date-range picker; sends `from`, `to`, `period` |
| `selectedRange` | `null` | preset range |
| `rangeStartYear` | `2021` | earliest year in the range picker |
| `perPage` | ShConfig `tablePerPage` (10) | persisted per table |
| `sortBy` / `sortMethod` | — / `'desc'` | initial sort |
| `paginationStyle` | ShConfig `tablePaginationStyle` | `'pages'` \| `'loadMore'` |
| `rowLink` | — | `'/users/{id}'` — whole row navigates (after `rowClick` fires) |
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
// action — one of handler / emit / link / popup / url, checked in that order
{ label, handler: (row)=>{}, emit: 'name', link: '/x/{id}', popup: 'Name' | {...}, url: 'x/{id}',
  confirm: 'msg', data, sendRowId: true, idKey: 'id', failMessage,   // url options
  permission, show: (row)=>bool, class }
// multi-action
{ label, handler: (rows)=>{}, permission, class }
```

**Columns:** `label` defaults to `startCase` of the last dot segment; `sortable` defaults to `true`, or `false` when a `component` is set. Plain and formatted cells render as **HTML** (`v-html`), so use a `component` or `#cell-` slot for user-generated content. A column named `actions` sets the header of the row-actions cell.

**Actions:** `{placeholders}` in `link` / `url` / `popup` titles are filled from the row by dot path (`{id}`, `{owner.id}`). A `url` action POSTs `{ ...data, id: row.id }` (`sendRowId: false` to opt out, `idKey` to send another column as `id`); with `confirm` it asks first. Either way it toasts the server's `message` (or `failMessage`) and reloads. `popup` is covered in [Popups](popups.md).

The table sends the classic server contract as query params — `page`, `per_page`, `filter_value`, `order_by`, `order_method`, `from`, `to`, `period`, `exact`, `paginated` (empty values omitted), plus your `params` — and expects a Laravel paginator response (`data`, `current_page`, `last_page`, `total`, …), so existing backends work unchanged.

## Offline-first cache

With `cache` (or the global `enableTableCache`):

1. The exact query's last response renders instantly from IndexedDB, then revalidates over the network.
2. Every fetched row is merged into a per-endpoint pool (capped at 3000, scoped per user id).
3. If the network is unreachable or slower than `network-timeout`, the query — **including search, sort and pagination** — runs locally against the pool and an amber offline banner shows. The next successful response clears it.

Helpers are exported for custom tables: `useTableData({ query, cacheEnabled, networkTimeout })`, `localQuery(rows, opts)`, and `clearTableCache()` (call on logout).
