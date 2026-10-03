<script setup>
// Internal: renders one popup layer's component inside its ShDialog/ShDrawer.
import { computed, provide, ref, shallowRef } from 'vue'
import ShSpinner from '../actions/ShSpinner.vue'
import { usePopups } from '../../popups/usePopups.js'
import { pickProps } from '../../popups/popupProps.js'
import { SH_DIALOG_CONTEXT, SH_POPUP_CONTEXT } from '../../theme/keys.js'

const props = defineProps({
    entry: { type: Object, required: true }
})

const popups = usePopups()
const component = shallowRef(null)
const status = ref('loading') // loading | ready | missing | error

const resolved = popups.resolve(props.entry.layer)
if (!resolved) {
    status.value = 'missing'
    console.warn(`[ShPopups] no popup registered as "${props.entry.layer.name}". Add it to the plugin's \`popups\` option.`)
} else if (typeof resolved.then === 'function') {
    resolved.then(c => {
        component.value = c
        status.value = 'ready'
    }).catch(error => {
        status.value = 'error'
        console.error(`[ShPopups] failed to load "${props.entry.layer.name}"`, error)
    })
} else {
    component.value = resolved
    status.value = 'ready'
}

const bound = computed(() => (component.value ? pickProps(component.value, props.entry.layer.params) : {}))
// remount the content (not the shell) when the props it receives change
const contentKey = computed(() => JSON.stringify(bound.value))

const context = popups.contextFor(props.entry)
provide(SH_DIALOG_CONTEXT, context)
provide(SH_POPUP_CONTEXT, {
    close: context.close,
    get layer () {
        return props.entry.layer
    }
})
</script>

<template>
    <div v-if="status === 'loading'" class="flex justify-center py-10 opacity-50">
        <ShSpinner class="size-6" />
    </div>
    <p v-else-if="status === 'missing'" class="text-sm text-red-500">
        Popup "{{ entry.layer.name }}" is not registered.
    </p>
    <p v-else-if="status === 'error'" class="text-sm text-red-500">
        Couldn't load this content. Please try again.
    </p>
    <component :is="component" v-else :key="contentKey" v-bind="bound" />
</template>
