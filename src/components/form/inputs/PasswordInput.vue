<script setup>
import { computed, ref } from 'vue'
import { useTheme } from '../../../theme/useTheme.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: String,
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean,
    autocomplete: { type: String, default: 'current-password' }
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const t = useTheme('inputs')
const visible = ref(false)

const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>

<template>
    <div :class="t.passwordWrapper">
        <input
            v-bind="$attrs"
            v-model="model"
            :type="visible ? 'text' : 'password'"
            :autocomplete="autocomplete"
            :placeholder="placeholder"
            :disabled="disabled"
            class="pr-9"
            @focus="emit('clearValidationErrors')"
        >
        <button type="button" :class="t.passwordToggle" tabindex="-1" @click="visible = !visible">
            <svg v-if="!visible" xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.04 12.32a1.01 1.01 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.57-3.01-9.96-7.18z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.22A10.48 10.48 0 002.04 11.68a1.01 1.01 0 000 .64C3.42 16.49 7.36 19.5 12 19.5c.99 0 1.95-.14 2.86-.39M6.23 6.23A10.45 10.45 0 0112 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64a10.5 10.5 0 01-4.19 5.45M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88"/>
            </svg>
        </button>
    </div>
</template>
