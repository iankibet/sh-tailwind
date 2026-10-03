<script setup>
// Mount once (App.vue). Renders the popup stack described by the URL —
// route meta popups and ?popup=… query layers — as dialogs and drawers.
import ShDialog from './ShDialog.vue'
import ShDrawer from './ShDrawer.vue'
import ShPopupContent from './ShPopupContent.vue'
import { usePopups } from '../../popups/usePopups.js'

const popups = usePopups()
popups.attach()

const shellProps = ({ type, title, size, side, static: isStatic }) =>
    type === 'drawer'
        ? { title, size, position: side, static: isStatic }
        : { title, size, static: isStatic }
</script>

<template>
    <component
        :is="entry.layer.type === 'drawer' ? ShDrawer : ShDialog"
        v-for="entry in popups.entries"
        :key="entry.uid"
        v-bind="shellProps(entry.layer)"
        :open="entry.open"
        @update:open="value => !value && popups.dismiss(entry)"
        @closed="popups.finalize(entry)"
    >
        <ShPopupContent :entry="entry" />
    </component>
</template>
