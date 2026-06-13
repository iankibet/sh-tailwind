# Inputs & masks

[← Back to overview](../README.md)

Every input is standalone-usable with a `v-model` contract (`modelValue` + `update:modelValue`, and a `clearValidationErrors` emit used by [ShForm](forms.md)). Override any type globally with the plugin's `formComponents`, or per-field with `component`.

## Input masks

Set `mask` on a field (or use `MaskedInput` directly) to auto-format as the user types:

| `mask` | Display | v-model receives |
|---|---|---|
| `'money'` | `1,234,567.89` | raw number `1234567.89` |
| `'integer'` | `1,234,567` | `1234567` |
| `{ type: 'money', prefix: 'KES ', decimals: 0 }` | `KES 50,000` | `50000` |
| `'#### #### #### ####'` | `4111 1111 1111 1111` | formatted string |
| `{ pattern: '#### ####', unmask: true }` | `1234 5678` | `12345678` (stripped) |
| `(value) => value.toUpperCase()` | `ABC` | `ABC` |

Pattern tokens: `#` digit, `A` letter, `N`/`*` alphanumeric; any other character is a literal. Money masks emit the **raw number** (clean for the backend); pattern masks emit the formatted string unless `unmask: true`.

```vue
<MaskedInput v-model="amount" mask="money" />
<MaskedInput v-model="card" mask="#### #### #### ####" />
```

`applyMask(value, mask)`, `maskMoney(raw, opts)` and `maskPattern(raw, pattern, opts)` are exported if you need them outside a form.

## PIN input

`type: 'pin'` (or the standalone `PinInput`) renders segmented digit boxes — auto-advance, backspace-to-previous, arrow nav, and paste-distributes-a-code.

```vue
<!-- in a form -->
{ name: 'otp', type: 'pin', digits: 6 }
{ name: 'wallet_pin', type: 'pin', digits: 4, secret: true }

<!-- standalone -->
<PinInput v-model="otp" :length="6" />
<PinInput v-model="pin" :length="4" secret />
```

Props: `length` (default 4), `secret` (mask as dots), `isInvalid`, `disabled`. Emits `update:modelValue`, `complete(value)` when all boxes are filled, and `clearValidationErrors`.

## Other inputs

| Component | Key props |
|---|---|
| `PhoneInput` | `countryCode` (default `'KE'`), `detectCountry` (opt-in `sh-country-code` lookup). Searchable country dropdown, **offline emoji flags** — no assets, no native select |
| `SelectInput` | `options` (array) **or** `url` (fetched with `{ all: 1 }`); coerces `{ id, label }` from loose shapes |
| `ShSuggest` | `options`/`url`, `multiple`, `allowCustom`, `optionTemplate`; debounced remote search, badges, keyboard nav |
| `PasswordInput` | show/hide eye toggle, `autocomplete` |
| `DateInput` | `withTime` → `datetime-local`, `min`, `max` |
| `NumberInput` | `min`, `max`, `step` |
| `TextInput` / `TextAreaInput` / `EmailInput` | `rows` (textarea) |
