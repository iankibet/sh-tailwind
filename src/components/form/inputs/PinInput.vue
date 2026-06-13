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
    disabled: Boolean
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors', 'complete'])

const t = useTheme('inputs')
const count = computed(() => Math.max(1, parseInt(props.length) || 4))
const boxes = ref([]) // input element refs
const digits = ref([])

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

const onInput = (index, event) => {
    emit('clearValidationErrors')
    const raw = event.target.value.replace(/\D/g, '')
    if (!raw) {
        digits.value[index] = ''
        emitValue()
        return
    }
    // take the last typed digit; advance through remaining boxes if pasted
    const chars = raw.split('')
    let i = index
    for (const char of chars) {
        if (i >= count.value) break
        digits.value[i] = char
        i++
    }
    emitValue()
    focusBox(Math.min(i, count.value - 1))
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

const onPaste = (event) => {
    event.preventDefault()
    const text = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, count.value)
    seed(text)
    emitValue()
    focusBox(Math.min(text.length, count.value - 1))
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
            :value="digit"
            :type="secret ? 'password' : 'text'"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            :disabled="disabled"
            :class="boxClass(index)"
            @input="onInput(index, $event)"
            @keydown="onKeydown(index, $event)"
            @paste="onPaste"
            @focus="$event.target.select(); emit('clearValidationErrors')"
        >
    </div>
</template>
