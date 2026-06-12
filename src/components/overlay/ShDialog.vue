<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useDialog } from '../../composables/useDialog.js'
import { useTheme } from '../../theme/useTheme.js'
import { SH_DIALOG_CONTEXT } from '../../theme/keys.js'

const props = defineProps({
    open: Boolean,
    title: String,
    size: { type: String, default: 'md' }, // sm | md | lg | xl | full
    static: Boolean,
    hideClose: Boolean,
    // keep the dialog open when a nested ShForm submits successfully
    retainOnSuccess: Boolean,
    classes: Object
})
const emit = defineEmits(['update:open', 'opened', 'closed'])

const t = useTheme('dialog', computed(() => props.classes))
const panel = ref(null)
const rendered = ref(false) // keeps the teleport mounted through leave animation
const visible = ref(false)  // drives the transitions
const pulsing = ref(false)  // static-backdrop feedback

const dialog = useDialog({
    isStatic: () => props.static,
    onClose: () => emit('update:open', false)
})

const show = () => {
    rendered.value = true
    dialog.show()
    requestAnimationFrame(() => {
        visible.value = true
    })
    if (!props.open) {
        emit('update:open', true)
    }
}

const close = (reason) => {
    visible.value = false
    dialog.close(reason)
}

const onBackdrop = () => {
    if (props.static) {
        // Bootstrap-style attention pulse
        pulsing.value = true
        setTimeout(() => { pulsing.value = false }, 150)
        return
    }
    close('backdrop')
}

watch(() => props.open, (value) => {
    if (value) {
        show()
    } else if (visible.value) {
        close('prop')
    }
}, { immediate: true })

// External Escape close happens through useDialog; sync visible state
watch(dialog.isOpen, (value) => {
    if (!value && visible.value) {
        visible.value = false
    }
})

// Nested forms can ask their host dialog to close (replaces the old
// Bootstrap `.closest('.modal-dialog')` hack)
provide(SH_DIALOG_CONTEXT, {
    close: () => close('context'),
    requestClose: (reason) => {
        if (reason === 'success') {
            if (props.retainOnSuccess) {
                return
            }
            // brief delay so the success toast registers before the panel leaves
            setTimeout(() => close('success'), 600)
            return
        }
        close(reason)
    }
})

defineExpose({ show, close })
</script>

<template>
    <teleport to="body">
        <div v-if="rendered" class="fixed inset-0" :style="{ zIndex: dialog.zIndex.value }">
            <Transition
                enter-active-class="transition-opacity duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-show="visible" :class="t.backdrop" @click="onBackdrop" />
            </Transition>
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
                @after-enter="panel?.focus(); emit('opened')"
                @after-leave="rendered = false; emit('closed')"
            >
                <div v-show="visible" :class="t.wrapper" @click.self="onBackdrop">
                    <div
                        ref="panel"
                        tabindex="-1"
                        role="dialog"
                        aria-modal="true"
                        :class="[t.panel, t.sizes[size] ?? t.sizes.md, pulsing ? 'scale-[1.02] transition-transform duration-150' : '']"
                    >
                        <header v-if="title || $slots.title || !hideClose" :class="t.header">
                            <slot name="title">
                                <h3 :class="t.title">{{ title }}</h3>
                            </slot>
                            <button v-if="!hideClose" type="button" :class="t.closeBtn" aria-label="Close" @click="close('button')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>
                        <div :class="t.body">
                            <slot :close="close" />
                        </div>
                        <footer v-if="$slots.footer" :class="t.footer">
                            <slot name="footer" :close="close" />
                        </footer>
                    </div>
                </div>
            </Transition>
        </div>
    </teleport>
</template>
