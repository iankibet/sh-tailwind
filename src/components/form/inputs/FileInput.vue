<script setup>
const props = defineProps({
    modelValue: [Object, Array, File, FileList],
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
