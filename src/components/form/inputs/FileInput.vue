<script setup>
const props = defineProps({
    // File | File[] | null; untyped so SSR / Node imports don't touch the
    // browser-only File / FileList globals at module load
    modelValue: null,
    accept: String,
    multiple: Boolean,
    isInvalid: Boolean,
    disabled: Boolean
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const onChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    emit('update:modelValue', props.multiple ? files : (files[0] ?? null))
}
</script>

<template>
    <input
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="onChange"
        @focus="emit('clearValidationErrors')"
    >
</template>
