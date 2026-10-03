<script setup>
// <ShPopupLink comp="ViewTask" type="drawer" :props="{ id: task.id }">View</ShPopupLink>
// A real <a href> (copy link / open in new tab work); a plain click stacks
// the popup on whatever is already open.
import { computed } from 'vue'
import { usePopups } from '../../popups/usePopups.js'

const props = defineProps({
    comp: { type: String, required: true },
    type: { type: String, default: 'dialog' }, // dialog | drawer
    title: String,
    size: String,
    side: String,
    static: Boolean,
    props: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['closed'])

const popups = usePopups()
const options = computed(() => ({
    type: props.type,
    title: props.title,
    size: props.size,
    side: props.side,
    static: props.static,
    props: props.props
}))
const href = computed(() => popups.href(props.comp, options.value))

const onClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return // let the browser open the href
    }
    event.preventDefault()
    popups.open(props.comp, { ...options.value, onClose: info => emit('closed', info) })
}
</script>

<template>
    <a :href="href" @click="onClick"><slot /></a>
</template>
