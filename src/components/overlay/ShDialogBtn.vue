<script setup>
import { ref } from 'vue'
import ShDialog from './ShDialog.vue'
import { useTheme } from '../../theme/useTheme.js'

defineProps({
    title: String,
    size: { type: String, default: 'md' },
    static: Boolean,
    hideClose: Boolean,
    btnClass: String,
    classes: Object
})
defineEmits(['opened', 'closed'])

const buttons = useTheme('buttons')
const open = ref(false)
</script>

<template>
    <button type="button" :class="btnClass ?? buttons.secondary" @click="open = true">
        <slot name="trigger">Open</slot>
    </button>
    <ShDialog
        v-model:open="open"
        :title="title"
        :size="size"
        :static="static"
        :hide-close="hideClose"
        :classes="classes"
        @opened="$emit('opened')"
        @closed="$emit('closed')"
    >
        <template #default="{ close }">
            <slot :close="close" />
        </template>
        <template v-if="$slots.footer" #footer="{ close }">
            <slot name="footer" :close="close" />
        </template>
    </ShDialog>
</template>
