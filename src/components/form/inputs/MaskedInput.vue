<script setup>
import { nextTick, ref, watch } from 'vue'
import { applyMask, maskInputMode } from '../../../utils/mask.js'

const props = defineProps({
    modelValue: [String, Number],
    // mask spec: named ('money'|'integer'|'decimal'), pattern string,
    // options object, or a (value) => string function
    mask: { type: [String, Object, Function], required: true },
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const display = ref('')

const sync = (value) => {
    const { display: formatted } = applyMask(value, props.mask)
    if (formatted !== display.value) {
        display.value = formatted
    }
}
watch(() => props.modelValue, sync, { immediate: true })
watch(() => props.mask, () => sync(props.modelValue))

const onInput = (event) => {
    emit('clearValidationErrors')
    const el = event.target
    const prevCaret = el.selectionStart ?? el.value.length
    const prevLen = el.value.length
    const { display: formatted, model } = applyMask(el.value, props.mask)
    display.value = formatted
    emit('update:modelValue', model)
    // keep the caret stable relative to the end as separators are inserted
    nextTick(() => {
        if (el.type !== 'text' && el.type !== 'tel') {
            return
        }
        let pos = prevCaret + (formatted.length - prevLen)
        pos = Math.max(0, Math.min(pos, formatted.length))
        try {
            el.setSelectionRange(pos, pos)
        } catch (err) {
            // some input types don't support selection range; ignore
        }
    })
}
</script>

<template>
    <input
        :value="display"
        type="text"
        :inputmode="maskInputMode(mask)"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @focus="emit('clearValidationErrors')"
    >
</template>
