# Forms

[← Back to overview](../README.md)

`ShForm` is a schema-driven form: type inference, input masks, Laravel `422` validation, and an optional multi-step wizard. For the inputs it renders and how to mask them, see [Inputs & masks](inputs.md).

## Example

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

## Props

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

## Field schema

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

## Validation

Laravel `422` errors (`reason.response.data.errors`) render under each field and clear on focus; in a wizard the form jumps to the first step containing an error.

## Multi-step wizard

Pass `steps` to split fields across pages:

```vue
<ShForm
    action="signup"
    :fields="['name', 'email', 'phone', 'password', 'description']"
    :steps="[
        { title: 'Account',  fields: ['name', 'email'] },
        { title: 'Security', fields: ['phone', 'password'] },
        { title: 'Profile',  fields: ['description'] }
    ]"
    submit-label="Create account"
/>
```

## Inside a dialog

A successful submit auto-closes the host `ShDialog` (set `retain-on-success` on the dialog, or `retain-dialog` on `ShDialogForm`, to keep it open). See [Overlays](overlays.md).
