# Popups — URL-driven dialogs & drawers

[← Back to overview](../README.md)

`ShPopups` opens dialogs and drawers from the URL. A popup survives a refresh, can be shared as a link, closes with the Back button, and can open another popup on top of itself. It's the Tailwind successor to shframework's `ShRoutePopups` / `ShQueryPopups`, and old links keep working.

Use it for content you'd want to link to or return to (view a record, edit a record, a detail panel opened from a table). For local, throwaway overlays keep using [`ShDialog` / `ShDrawer`](overlays.md) with `v-model:open`.

## Setup

1. Register the components that can be opened as popups (eager or lazy):

```js
app.use(ShTailwind, {
    popups: {
        ViewTask,                                   // eager
        EditTask: () => import('./EditTask.vue')    // lazy, loads on first open (spinner meanwhile)
    }
})
app.use(router)
```

2. Mount the host once, next to your `<router-view>`:

```vue
<!-- App.vue -->
<router-view />
<ShPopups />
```

Only registered names can be opened from a URL, so a crafted link can't mount an arbitrary component. Names match case-insensitively and ignore `-`/`_` (`view-task` finds `ViewTask`). `usePopups().register(name, component)` adds one at runtime.

## Opening a popup

```vue
<!-- a real <a href>: copy link / open in new tab work -->
<ShPopupLink comp="ViewTask" type="drawer" title="Task" :props="{ id: task.id }">View</ShPopupLink>
```

```js
const popups = usePopups()
popups.open('EditTask', {
    type: 'dialog',            // dialog (default) | drawer
    title: 'Edit task',
    size: 'lg',                // sm | md | lg | xl | full
    side: 'end',               // drawers: start | end | top | bottom (left/right accepted)
    static: false,             // true: no Escape / backdrop close
    props: { id: 5 },          // strings, numbers, booleans; they go in the URL
    onClose: ({ reason, result }) => { /* ... */ }
})
```

From a table row (see [Table](table.md#action-handlers)):

```js
{ label: 'View', popup: { comp: 'ViewTask', type: 'drawer', title: '{name}' } }  // props default to { id: row.id }
{ label: 'Edit', popup: 'EditTask' }
```

The table reloads when the popup closes after a successful form submit, or after `close({ reload: true })`. Set `reload: false` in the popup spec to opt out.

Or write the URL by hand:

```
/tasks?popup=drawer&comp=ViewTask&title=Task&id=5
```

## Writing a popup component

Declare the props you expect. URL values are strings, so they're **coerced to the declared type** (`Number`, `Boolean`, `Array` from `a,b,c`, `Object` from JSON). **Only declared props are passed.** Other query keys never leak onto your root element as attributes.

```vue
<script setup>
import { usePopups, usePopupContext } from '@iankibetsh/sh-tailwind'

const props = defineProps({ id: { type: Number, required: true } }) // "5" -> 5
const popups = usePopups()
const popup = usePopupContext() // { close(result), layer } — null when not in a popup

const edit = () => popups.open('EditTask', { title: 'Edit', props: { id: props.id } }) // stacks on top
</script>

<template>
    …
    <button @click="popup.close({ reload: true })">Done</button>
</template>
```

- A nested **`ShForm` closes its popup on success** with no extra wiring. Reason `'success'`, after a short delay so the toast registers.
- If the props change while the popup is open (e.g. `id=5` → `id=6`), the content remounts and the panel stays put.
- `popup.layer.params` has every raw URL value, including ones you didn't declare.

## Stacking

Each layer above the first namespaces its keys with `p{n}.`:

```
?popup=drawer&comp=ViewTask&id=5&p1.popup=dialog&p1.comp=EditTask&p1.id=5
```

`open()` and `ShPopupLink` always stack on top of what's open. Escape closes only the topmost popup. Closing a lower popup also closes everything above it.

## Closing & history

- **Opened in-app** (link, `open()`): closing calls `router.back()`, so there's no stray forward entry, and Back reopens nothing.
- **Landed on the URL directly** (refresh, shared link): closing uses `router.replace()` to the same page without the popup, so Back doesn't leave your app.
- The browser Back button closes the top popup, with its animation.

On close, the layer's keys are removed from the URL. For layer 0 that means the control keys plus the props its component declares. Page query keys you didn't hand to the popup stay.

`onClose` callbacks and `usePopups().onClosed(fn)` get `{ name, reason, result, layer }`:

| reason | when |
|---|---|
| `success` | a nested `ShForm` submitted |
| `closed` | `popup.close(result)` / `usePopups().close(result)` |
| `dismiss` | X button, Escape, backdrop |
| `navigation` | URL changed (Back button, a link to another page, a lower layer closed) |

`onClose` from `open()` lives in memory, so it doesn't survive a page refresh. Use `onClosed` on the page if you need to react to popups opened from shared links.

## Route popups

A child route can render as a popup over its parent page:

```js
{
    path: '/tasks',
    component: Tasks,           // no <router-view> inside, so the child only renders as a popup
    children: [{
        path: ':id/view',
        component: () => import('./ViewTask.vue'),
        meta: { popup: 'drawer', title: 'Task', size: 'lg', side: 'end', static: false }
    }]
}
```

Route params become props (with the same type coercion). `meta.title` can be a function of the route. Closing navigates to the nearest ancestor route that renders a component, with params filled in. Set `meta.back` (string or `route => location`) to override that. Query popups can stack on top of a route popup.

## Built-in: URL form

`ShPopupForm` (also registered as `ShQueryForm` and `ShForm`) renders a [`ShForm`](forms.md) from the URL:

```
?popup=dialog&comp=ShPopupForm&title=New task&action=tasks/store&fields=name,email,phone
```

Props: `action`, `fields` (comma list), `method`, `submitLabel`, `successMessage`.

## Migrating from shframework

| shframework | sh-tailwind |
|---|---|
| `<sh-route-popups/>` + `<sh-query-popups/>` | one `<ShPopups />` |
| `app.component('ViewTask', …)` | `popups: { ViewTask }` plugin option |
| `meta: { popup: 'modal' }` / `'canvas'` | works as is (`dialog` / `drawer` are the new names) |
| `?popup=offcanvas&component=X&side=end&id=5` | works as is |
| component reads `route.query.id` | declare `id` as a prop (or read `usePopupContext().layer.params`) |
| `comp=ShQueryForm&fields=…&action=…` | works as is |

Without vue-router installed, `open()` still works with an in-memory stack. There's no URL, refresh or Back support in that mode.
