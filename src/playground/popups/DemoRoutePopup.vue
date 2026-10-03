<script setup>
import { usePopupContext } from '../../popups/usePopups.js'

defineProps({
    id: { type: Number, required: true }
})
const popup = usePopupContext()
</script>

<template>
    <div class="space-y-3 text-sm text-gray-600">
        <p>Rendered from a route with <code>meta.popup: 'drawer'</code>. Route param <code>id</code> = {{ id }} ({{ typeof id }}).</p>
        <p>Refresh the page: it reopens. Back closes it.</p>
        <button class="rounded-md border border-gray-300 px-3 py-1.5" @click="popup.close()">Close</button>
    </div>
</template>
