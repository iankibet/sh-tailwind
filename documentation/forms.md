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

A field is a string (`'email'` → `{ name: 'email' }`) or an object:

| Key | Applies to | Notes |
|---|---|---|
| `name` | all | **required** |
| `type` | all | omitted → [inferred](#type-inference). Explicit: `text` `textarea` `email` `password` `pin` `number` `date` `select` `suggest` `phone` `file` `hidden` |
| `label` | all | default `startCase(name)`; `false` hides it |
| `placeholder` | text-like | |
| `helper` | all | rendered **as HTML** under the field |
| `required` | all | shows a `*`; cosmetic, the server still validates |
| `value` | all | initial value; else `currentData[name]`, else `null` |
| `disabled` | all | disable just this field |
| `id`, `autocomplete` | all | forwarded to the input (`id` defaults to `name`) for browser autofill |
| `class` | all | extra classes appended to the input element |
| `props` | all | object v-bound onto the input component (wins over the keys above) |
| `component` | all | render this field with a [custom component](#custom-inputs) |
| `options` | select / suggest | an array ([shapes](#option-shapes)) **or** `{ url: 'endpoint' }` |
| `multiple` | select / suggest / file | multi-value; on an options field it switches to `suggest` |
| `allowCustom` | suggest | accept free text not in the list; switches to `suggest` |
| `optionTemplate` | suggest | component rendering each option row |
| `rows` | textarea | |
| `min` `max` `step` | number | |
| `min` `max` `withTime` | date | ISO bounds; `withTime` renders `datetime-local` |
| `countryCode` `detectCountry` | phone | default country `'KE'`; `detectCountry` opts in to a remote lookup |
| `digits` (alias `length`) `secret` | pin | box count (default 4); `secret` masks digits as dots |
| `accept` | file | e.g. `'image/*'` |
| `mask` | text-like | string, object or function, see [Inputs & masks](inputs.md#input-masks) |

### Type inference

When `type` is omitted, the first matching rule wins:

1. `component` set → custom component
2. `options` set → `suggest` if `multiple` or `allowCustom`, else `select`
3. Exact name: `password`, `password_confirmation` → `password` · `pin` → `pin` · `email` → `email` · `phone`, `phone_number` → `phone` · `message`, `description`, `comments`, `notes` → `textarea` · `age` → `number` · `date` → `date`
4. Suffix: `*_email` → `email` · `*_phone` → `phone` · `*_at`, `*_date`, `*_on` → `date`
5. Otherwise `text`

A field with a `mask` renders through `MaskedInput` whatever its type (except `pin`). Name fields after your columns and you rarely need `type`.

### Option shapes

`select` and `suggest` accept loose shapes:

```js
options: ['draft', 'live']                                   // value = label = the string
options: [{ id: 3, name: 'Editorial' }]                      // value = id, label = name
options: [{ value: 'draft', label: 'Draft' }]                // value / key / name, label / name / option
options: { url: 'departments/options' }                      // GET with { all: 1 }; array or { data: [...] }
```

## File uploads

A `type: 'file'` field (`v-model` is a `File`, or `File[]` with `multiple`) makes `ShForm` send the whole payload as `multipart/form-data`: arrays as `key[]`, nested objects JSON-encoded, and `PUT`/`PATCH` tunnelled as `POST` with `_method`. Laravel reads it with `request()->file('avatar')`.

```js
{ name: 'avatar', type: 'file', accept: 'image/*', required: true }
```

## Custom inputs

Per field, or globally per type through the plugin:

```js
{ name: 'colour', component: ColourPicker, props: { swatches } }

app.use(ShTailwind, { formComponents: { date: MyDatePicker } })   // every date field
```

A custom input takes `modelValue`, emits `update:modelValue`, and may emit `clearValidationErrors` when the user starts correcting an error. It also receives `isInvalid` and the field's props.

## `preSubmit`

```vue
<ShForm
    action="orders"
    :fields="fields"
    :pre-submit="(data) => {
        if (!data.terms) { shRepo.showToast('Accept the terms', 'error'); return false }  // abort
        return { ...data, source: 'web' }                                                // replace payload
    }"
/>
```

Return `false` to abort, an object to replace the payload; anything else submits unchanged. It may be `async`.

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
