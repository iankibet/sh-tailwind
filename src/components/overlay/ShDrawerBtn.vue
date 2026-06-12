<script setup>
import { ref } from 'vue'
import ShDrawer from './ShDrawer.vue'
import { useTheme } from '../../theme/useTheme.js'

defineProps({
    title: String,
    position: { type: String, default: 'end' },
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
    <ShDrawer
        v-model:open="open"
        :title="title"
        :position="position"
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
    </ShDrawer>
</template>
