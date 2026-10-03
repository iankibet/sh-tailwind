<script setup>
// Built-in popup: a ShForm configured entirely from the URL, e.g.
// ?popup=dialog&comp=ShPopupForm&title=New task&action=tasks/store&fields=name,email
// (also registered as ShQueryForm / ShForm for shframework links)
import { computed } from 'vue'
import ShForm from '../form/ShForm.vue'

const props = defineProps({
    action: { type: String, required: true },
    fields: { type: [Array, String], required: true },
    method: { type: String, default: 'post' },
    submitLabel: String,
    successMessage: String
})

const fieldList = computed(() =>
    Array.isArray(props.fields)
        ? props.fields
        : props.fields.split(',').map(f => f.trim()).filter(Boolean)
)
</script>

<template>
    <ShForm
        :action="action"
        :fields="fieldList"
        :method="method"
        :submit-label="submitLabel"
        :success-message="successMessage"
    />
</template>
