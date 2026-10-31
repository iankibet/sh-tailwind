import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyMask, maskInputMode } from '../src/utils/mask.js'

// Types key by key the way MaskedInput sees it: each key lands on the current display.
const type = (keys, mask) => {
    let result = { display: '', model: '' }
    for (const key of keys) {
        result = applyMask(result.display + key, mask)
    }
    return result
}

const wholeMasks = ['integer', 'number', { integer: true }, { decimals: 0 }, { type: 'money', prefix: 'KES ', decimals: 0 }]

test('typing a dot in a whole-number field never joins the digits after it', () => {
    for (const mask of wholeMasks) {
        const { display, model } = type('200.23', mask)
        assert.equal(model, '200', JSON.stringify(mask))
        assert.match(display, /200\.$/, JSON.stringify(mask))
    }
})

test('whole-number masks group thousands and drop pasted cents', () => {
    assert.deepEqual(applyMask('3000', { integer: true }), { display: '3,000', model: '3000' })
    assert.deepEqual(applyMask('1234567', 'integer'), { display: '1,234,567', model: '1234567' })
    assert.equal(applyMask('3000.00', { decimals: 0 }).model, '3000')
})

test('money keeps two decimals', () => {
    assert.deepEqual(type('200.234', 'money'), { display: '200.23', model: '200.23' })
    assert.deepEqual(applyMask('1234.5', 'money'), { display: '1,234.5', model: '1234.5' })
})

test('whole-number masks ask phones for the digits-only keypad', () => {
    for (const mask of wholeMasks) {
        assert.equal(maskInputMode(mask), 'numeric', JSON.stringify(mask))
    }
    assert.equal(maskInputMode('money'), 'decimal')
    assert.equal(maskInputMode('decimal'), 'decimal')
    assert.equal(maskInputMode('#### ####'), 'numeric')
})
