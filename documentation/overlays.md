# Overlays — dialogs & drawers

[← Back to overview](../README.md)

Tailwind-native modal and slide-over panels — Teleport + Transition, no Bootstrap JS.

## Example

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

## ShDialog

**Props:** `open` (v-model), `title` (or `#title` slot), `size` (`sm|md|lg|xl|full`, default `md`), `static` (disables Escape/backdrop close — backdrop click pulses the panel), `hideClose`, `retainOnSuccess`, `classes`.
**Events:** `update:open`, `opened`, `closed`. **Exposes:** `show()`, `close()`.
**Slots:** default (`{ close }`), `#title`, `#footer="{ close }"`.

## ShDrawer

Same as `ShDialog` plus `position` (`start|end|top|bottom`, default `end`); same size/static/events/slots.

## Trigger + form helpers

**ShDialogBtn / ShDrawerBtn** render a trigger button + the overlay; props add `btnClass` and a `#trigger` slot.

**ShDialogForm** = trigger + dialog + [`ShForm`](forms.md) (all ShForm props pass through), re-keys the form on `currentData`, auto-closes ~600ms after success unless `retain-dialog`.

## Behaviour

Dialogs stack — Escape closes the topmost first; body scroll locks while open; focus returns to the trigger on close. The low-level `useDialog({ isStatic, onOpen, onClose })` → `{ isOpen, zIndex, show, close, onBackdrop }` is exported if you're building your own overlay.
