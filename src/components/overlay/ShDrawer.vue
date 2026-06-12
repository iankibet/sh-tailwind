<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useDialog } from '../../composables/useDialog.js'
import { useTheme } from '../../theme/useTheme.js'
import { SH_DIALOG_CONTEXT } from '../../theme/keys.js'

const props = defineProps({
    open: Boolean,
    title: String,
    position: { type: String, default: 'end' }, // start | end | top | bottom
    size: { type: String, default: 'md' },
    static: Boolean,
    hideClose: Boolean,
    classes: Object
})
const emit = defineEmits(['update:open', 'opened', 'closed'])

const t = useTheme('drawer', computed(() => props.classes))
const panel = ref(null)
const rendered = ref(false)
const visible = ref(false)

// Whole class literals per position so Tailwind @source extraction works
const positions = {
    start: { panel: 'inset-y-0 left-0 h-full w-full', hidden: '-translate-x-full' },
    end: { panel: 'inset-y-0 right-0 h-full w-full', hidden: 'translate-x-full' },
    top: { panel: 'inset-x-0 top-0 w-full', hidden: '-translate-y-full' },
    bottom: { panel: 'inset-x-0 bottom-0 w-full', hidden: 'translate-y-full' }
}
const pos = computed(() => positions[props.position] ?? positions.end)
const isVertical = computed(() => ['top', 'bottom'].includes(props.position))
const sizeClass = computed(() =>
    isVertical.value
        ? (t.value.sizesVertical[props.size] ?? t.value.sizesVertical.md)
        : (t.value.sizes[props.size] ?? t.value.sizes.md)
)

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

watch(() => props.open, (value) => {
    if (value) {
        show()
    } else if (visible.value) {
        close('prop')
    }
}, { immediate: true })

watch(dialog.isOpen, (value) => {
    if (!value && visible.value) {
        visible.value = false
    }
})

provide(SH_DIALOG_CONTEXT, {
    close: () => close('context'),
    requestClose: (reason) => close(reason)
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
                <div v-show="visible" :class="t.backdrop" @click="dialog.onBackdrop" />
            </Transition>
            <Transition
                enter-active-class="transition-transform duration-250 ease-out"
                :enter-from-class="pos.hidden"
                enter-to-class="translate-x-0 translate-y-0"
                leave-active-class="transition-transform duration-200 ease-in"
                leave-from-class="translate-x-0 translate-y-0"
                :leave-to-class="pos.hidden"
                @after-enter="panel?.focus(); emit('opened')"
                @after-leave="rendered = false; emit('closed')"
            >
                <div
                    v-show="visible"
                    ref="panel"
                    tabindex="-1"
                    role="dialog"
                    aria-modal="true"
                    :class="[t.panel, pos.panel, sizeClass]"
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
                </div>
            </Transition>
        </div>
    </teleport>
</template>
