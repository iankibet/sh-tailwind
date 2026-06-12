<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean,
    rows: { type: [Number, String], default: 3 }
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>

<template>
    <textarea
        v-model="model"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="emit('clearValidationErrors')"
    />
</template>
