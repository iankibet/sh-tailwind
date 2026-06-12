<script setup>
import { computed, ref } from 'vue'
import ShDialog from './ShDialog.vue'
import ShForm from '../form/ShForm.vue'
import { useTheme } from '../../theme/useTheme.js'

const props = defineProps({
    // dialog
    title: String,
    size: { type: String, default: 'md' },
    static: Boolean,
    retainDialog: Boolean,
    btnClass: String,
    dialogClasses: Object,
    // form (passed through to ShForm)
    action: { type: String, required: true },
    method: { type: String, default: 'post' },
    fields: { type: Array, required: true },
    currentData: Object,
    steps: Array,
    submitLabel: { type: String, default: 'Submit' },
    successMessage: String,
    retainData: Boolean,
    preSubmit: Function,
    hiddenId: { type: Boolean, default: true },
    classes: Object
})
const emit = defineEmits(['success', 'error', 'fieldChanged', 'opened', 'closed'])

const buttons = useTheme('buttons')
const open = ref(false)

// Re-key the form whenever the record being edited changes
const formKey = computed(() => JSON.stringify(props.currentData ?? {}))

const onSuccess = (data) => {
    emit('success', data)
}

defineExpose({
    show: () => { open.value = true },
    close: () => { open.value = false }
})
</script>

<template>
    <button type="button" :class="btnClass ?? buttons.primary" @click="open = true">
        <slot name="trigger">{{ title ?? 'Open form' }}</slot>
    </button>
    <ShDialog
        v-model:open="open"
        :title="title"
        :size="size"
        :static="static"
        :retain-on-success="retainDialog"
        :classes="dialogClasses"
        @opened="$emit('opened')"
        @closed="$emit('closed')"
    >
        <ShForm
            :key="formKey"
            :action="action"
            :method="method"
            :fields="fields"
            :current-data="currentData"
            :steps="steps"
            :submit-label="submitLabel"
            :success-message="successMessage"
            :retain-data="retainData"
            :pre-submit="preSubmit"
            :hidden-id="hiddenId"
            :classes="classes"
            @success="onSuccess"
            @error="$emit('error', $event)"
            @field-changed="(name, value, data) => $emit('fieldChanged', name, value, data)"
        >
            <slot />
        </ShForm>
    </ShDialog>
</template>
