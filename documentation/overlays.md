# Overlays — dialogs & drawers

[← Back to overview](../README.md)

Tailwind-native modal and slide-over panels — Teleport + Transition, no Bootstrap JS.

Need the overlay in the URL (refresh-safe, linkable, closes on Back, stackable)? Use [Popups](popups.md).

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

Same as `ShDialog` plus `position` (`start|end|top|bottom`, default `end`). `size` is the width for `start`/`end` and the height for `top`/`bottom`. Same `static` / `hideClose` / events / `show()` / `close()`, but **no `#footer` slot**: put actions in the body.

## Trigger + form helpers

**ShDialogBtn / ShDrawerBtn** render a trigger button + the overlay; props add `btnClass` and a `#trigger` slot.

**ShDialogForm** = trigger + dialog + [`ShForm`](forms.md). It re-keys the form when `currentData` changes and auto-closes ~600 ms after success unless `retain-dialog`.

- Dialog props: `title`, `size`, `static`, `retainDialog`, `btnClass`, `dialogClasses`.
- Form props passed through: `action`, `method`, `fields`, `currentData`, `steps`, `submitLabel`, `successMessage`, `retainData`, `preSubmit`, `hiddenId`, `classes`.
- **`v-model:open`** (optional): pass it to control opening yourself (e.g. edit from a table row). The built-in trigger button is then hidden.
- **Events:** `success`, `error`, `fieldChanged`, `opened`, `closed`, `update:open`.

## Behaviour

Dialogs stack — Escape closes the topmost first; body scroll locks while open; focus returns to the trigger on close. The low-level `useDialog({ isStatic, onOpen, onClose })` → `{ isOpen, zIndex, show, close, onBackdrop }` is exported if you're building your own overlay.
