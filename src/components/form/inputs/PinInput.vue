<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useTheme } from '../../../theme/useTheme.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: [String, Number],
    // number of digit boxes
    length: { type: [Number, String], default: 4 },
    // render entries as dots (secret PIN) vs. visible (OTP code)
    secret: Boolean,
    isInvalid: Boolean,
    disabled: Boolean,
    id: String,
    // defaults to 'one-time-code' for codes and 'off' for secret PINs
    autocomplete: String
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors', 'complete'])

const t = useTheme('inputs')
const count = computed(() => Math.max(1, parseInt(props.length) || 4))
const boxes = ref([]) // input element refs
const digits = ref([])

// Only the first box asks for one-time-code autofill, so iOS/Android offer the
// code once and fill from the start.
const autocompleteFor = (index) => {
    if (index > 0) return 'off'
    return props.autocomplete ?? (props.secret ? 'off' : 'one-time-code')
}

// Secret digits show as a bullet instead of using type="password", which would
// pull in password managers and "save password" prompts.
const shown = (digit) => (props.secret && digit ? '●' : digit)

const seed = (value) => {
    const chars = String(value ?? '').replace(/\D/g, '').slice(0, count.value).split('')
    digits.value = Array.from({ length: count.value }, (_, i) => chars[i] ?? '')
}
seed(props.modelValue)

// re-seed when the count changes or the model is set externally
watch(count, () => seed(props.modelValue))
watch(() => props.modelValue, (value) => {
    if (value !== digits.value.join('')) {
        seed(value)
    }
})

const emitValue = () => {
    const value = digits.value.join('')
    emit('update:modelValue', value)
    if (value.length === count.value) {
        emit('complete', value)
    }
}

const focusBox = (index) => {
    nextTick(() => {
        const el = boxes.value[index]
        el?.focus()
        el?.select()
    })
}

// Spread digits from `start`; a whole code always fills from the first box.
const fill = (start, chars) => {
    let i = chars.length >= count.value ? 0 : start
    for (const char of chars) {
        if (i >= count.value) break
        digits.value[i] = char
        i++
    }
    emitValue()
    if (i >= count.value) {
        boxes.value[count.value - 1]?.blur()
    } else {
        focusBox(i)
    }
}

const onInput = (index, event) => {
    emit('clearValidationErrors')
    const raw = event.target.value.replace(/\D/g, '')
    // a single keystroke: keep just the typed digit (the box may already hold one)
    if (event.inputType === 'insertText' && /^\d$/.test(event.data ?? '')) {
        event.target.value = shown(event.data)
        fill(index, [event.data])
        return
    }
    if (!raw) {
        digits.value[index] = ''
        event.target.value = ''
        emitValue()
        return
    }
    // keyboard paste, autofill from messages/email, or replacement text
    fill(index, raw.split(''))
    event.target.value = shown(digits.value[index])
}

const onKeydown = (index, event) => {
    if (event.key === 'Backspace') {
        event.preventDefault()
        if (digits.value[index]) {
            digits.value[index] = ''
        } else if (index > 0) {
            digits.value[index - 1] = ''
            focusBox(index - 1)
        }
        emitValue()
    } else if (event.key === 'ArrowLeft' && index > 0) {
        focusBox(index - 1)
    } else if (event.key === 'ArrowRight' && index < count.value - 1) {
        focusBox(index + 1)
    }
}

const onPaste = (index, event) => {
    event.preventDefault()
    const chars = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').split('')
    if (!chars.length) return
    emit('clearValidationErrors')
    fill(index, chars)
}

const boxClass = (index) => {
    if (props.isInvalid) {
        return t.value.pin.boxInvalid
    }
    return digits.value[index] ? t.value.pin.boxFilled : t.value.pin.box
}
</script>

<template>
    <div :class="t.pin.wrapper">
        <input
            v-for="(digit, index) in digits"
            :key="index"
            :ref="el => (boxes[index] = el)"
            :id="index === 0 ? id : undefined"
            :value="shown(digit)"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :autocomplete="autocompleteFor(index)"
            autocorrect="off"
            spellcheck="false"
            :aria-label="`Digit ${index + 1} of ${count}`"
            :disabled="disabled"
            :class="boxClass(index)"
            @input="onInput(index, $event)"
            @keydown="onKeydown(index, $event)"
            @paste="onPaste(index, $event)"
            @focus="$event.target.select(); emit('clearValidationErrors')"
        >
    </div>
</template>
