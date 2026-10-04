<script setup>
import { computed } from 'vue'

definePage({
    title: 'Administrators',
    description: 'Review administrator accounts.',
    breadcrumbs: [
        { label: 'Dashboard', href: '/' },
        { label: 'Administrators', href: '/admins' }
    ]
})

const ready = computed(() => true)
</script>

<template><div v-if="ready" /></template>
