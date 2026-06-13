import { startCase } from './strings.js'

// Exact-name inference carried over from shframework's ShAutoForm
const NAME_TYPE_MAP = {
    password: 'password',
    pin: 'pin',
    password_confirmation: 'password',
    message: 'textarea',
    description: 'textarea',
    comments: 'textarea',
    notes: 'textarea',
    email: 'email',
    phone: 'phone',
    phone_number: 'phone',
    age: 'number',
    date: 'date'
}

function inferType (field) {
    if (field.type) {
        return field.type
    }
    if (field.component) {
        return 'custom'
    }
    if (field.options) {
        return (field.multiple || field.allowCustom) ? 'suggest' : 'select'
    }
    const name = field.name ?? ''
    if (NAME_TYPE_MAP[name]) {
        return NAME_TYPE_MAP[name]
    }
    if (/_email$/.test(name)) return 'email'
    if (/_phone$/.test(name)) return 'phone'
    if (/(_at|_date|_on)$/.test(name)) return 'date'
    return 'text'
}

/**
 * Normalize a fields array (strings or partial objects) into full field
 * objects with reactive-ready `value` seeds.
 */
export function normalizeFields (fields, currentData = {}) {
    return (fields ?? []).map(raw => {
        const field = typeof raw === 'string' ? { name: raw } : { ...raw }
        field.name = field.name ?? field.field
        if (!field.name) {
            console.warn('[sh-tailwind] form field without a name was skipped', raw)
            return null
        }
        field.type = inferType(field)
        if (field.label !== false) {
            field.label = field.label ?? startCase(field.name)
        }
        field.placeholder = field.placeholder ?? ''
        field.helper = field.helper ?? ''
        field.required = !!field.required
        field.value = field.value ?? currentData?.[field.name] ?? null
        return field
    }).filter(Boolean)
}
