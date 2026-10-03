<script setup>
import { computed } from 'vue'
import ShForm from '../../components/form/ShForm.vue'
import { demoUsers } from '../demoData.js'

const props = defineProps({
    id: { type: Number, required: true }
})
const user = computed(() => demoUsers.find(u => u.id === props.id))
</script>

<template>
    <!-- success closes this layer through the URL (no host wiring needed) -->
    <ShForm
        action="demo/users/update"
        :fields="['name', 'email']"
        :current-data="user"
        success-message="Saved"
    />
</template>
