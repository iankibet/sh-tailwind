// Lightweight, dependency-free input masking.
//
// A field's `mask` can be:
//   - a named numeric mask: 'money' | 'integer' | 'decimal'
//   - a pattern string: '#' = digit, 'A' = letter, 'N'/'*' = alphanumeric,
//     any other char is a literal e.g. '#### #### #### ####', '(###) ###-####'
//   - an options object: { pattern, unmask } or { type:'money', decimals, prefix, suffix }
//   - a function: (rawValue) => formattedString
//
// applyMask returns { display, model }:
//   display = what the user sees, model = what v-model emits (raw number for
//   money, stripped tokens when unmask:true, otherwise the formatted string).

const TOKENS = {
    '#': /[0-9]/,
    A: /[a-zA-Z]/,
    N: /[a-zA-Z0-9]/,
    '*': /[a-zA-Z0-9]/
}

const NAMED = ['money', 'integer', 'number', 'decimal']

export function isNamedNumericMask (mask) {
    return typeof mask === 'string' && NAMED.includes(mask)
}

export function maskPattern (raw, pattern, { unmask = false } = {}) {
    const chars = String(raw ?? '').split('')
    let display = ''
    let model = ''
    let ci = 0
    for (let i = 0; i < pattern.length; i++) {
        const token = TOKENS[pattern[i]]
        if (token) {
            while (ci < chars.length && !token.test(chars[ci])) ci++
            if (ci >= chars.length) break
            display += chars[ci]
            model += chars[ci]
            ci++
        } else if (ci < chars.length) {
            // insert literal only while there is more input to place after it
            display += pattern[i]
        }
    }
    return { display, model: unmask ? model : display }
}

export function maskMoney (raw, { decimals = 2, prefix = '', suffix = '', integer = false } = {}) {
    let s = String(raw ?? '').replace(/[^0-9.]/g, '')
    const dot = s.indexOf('.')
    if (dot !== -1) {
        s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '')
    }
    if (integer) {
        // drop the decimal part rather than merging the digits
        s = s.split('.')[0]
    }
    let [int = '', dec] = s.split('.')
    int = int.replace(/^0+(?=\d)/, '')
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const hasDot = s.includes('.') && !integer

    let display = grouped
    let model = int
    if (hasDot) {
        dec = (dec ?? '').slice(0, decimals)
        display = (grouped || '0') + '.' + dec
        model = (int || '0') + '.' + dec
    }
    if (display) {
        display = prefix + display + suffix
    }
    return { display, model }
}

export function applyMask (value, mask) {
    if (typeof mask === 'function') {
        const display = mask(value) ?? ''
        return { display: String(display), model: String(display) }
    }
    if (mask && typeof mask === 'object') {
        if (mask.pattern) {
            return maskPattern(value, mask.pattern, mask)
        }
        return maskMoney(value, mask)
    }
    if (isNamedNumericMask(mask)) {
        return maskMoney(value, { integer: mask === 'integer' || mask === 'number', decimals: mask === 'integer' || mask === 'number' ? 0 : 2 })
    }
    return maskPattern(value, String(mask))
}

// inputmode hint for the on-screen keyboard
export function maskInputMode (mask) {
    if (isNamedNumericMask(mask) || (mask && typeof mask === 'object' && !mask.pattern)) {
        return 'decimal'
    }
    const pattern = typeof mask === 'string' ? mask : (mask && mask.pattern)
    if (typeof pattern === 'string' && /^[#\s().+-]*$/.test(pattern)) {
        return 'numeric'
    }
    return 'text'
}
