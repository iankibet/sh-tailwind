<script setup>
import { computed } from 'vue'
import { usePopups, usePopupContext } from '../../popups/usePopups.js'
import { demoUsers } from '../demoData.js'

// `id` arrives from the URL as "5" and is coerced to the declared Number
const props = defineProps({
    id: { type: Number, required: true }
})

const popups = usePopups()
const popup = usePopupContext()
const user = computed(() => demoUsers.find(u => u.id === props.id))

const edit = () => popups.open('DemoEditUser', {
    title: `Edit ${user.value.name}`,
    props: { id: props.id }
})
</script>

<template>
    <div v-if="user" class="space-y-4 text-sm">
        <dl class="grid grid-cols-3 gap-y-2">
            <dt class="text-fg-subtle">ID</dt><dd class="col-span-2">{{ user.id }} <span class="text-xs text-fg-subtle">({{ typeof id }})</span></dd>
            <dt class="text-fg-subtle">Name</dt><dd class="col-span-2">{{ user.name }}</dd>
            <dt class="text-fg-subtle">Email</dt><dd class="col-span-2">{{ user.email }}</dd>
            <dt class="text-fg-subtle">Role</dt><dd class="col-span-2">{{ user.role }}</dd>
        </dl>
        <div class="flex gap-2">
            <button class="rounded-md bg-primary px-3 py-1.5 text-white" @click="edit">Edit (stacks a dialog)</button>
            <button class="rounded-md border border-line-strong px-3 py-1.5" @click="popup.close({ reload: true })">Close &amp; reload table</button>
        </div>
    </div>
    <p v-else class="text-sm text-fg-subtle">User {{ id }} not found.</p>
</template>
