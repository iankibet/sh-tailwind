<script setup>
import { ref } from 'vue'
import ShForm from '../components/form/ShForm.vue'
import ShDialog from '../components/overlay/ShDialog.vue'
import ShDrawer from '../components/overlay/ShDrawer.vue'
import ShDialogBtn from '../components/overlay/ShDialogBtn.vue'
import ShDrawerBtn from '../components/overlay/ShDrawerBtn.vue'
import ShDialogForm from '../components/overlay/ShDialogForm.vue'
import ShConfirmAction from '../components/actions/ShConfirmAction.vue'
import ShSilentAction from '../components/actions/ShSilentAction.vue'

const dialogOpen = ref(false)
const staticDialog = ref(false)
const drawerOpen = ref(false)
const drawerPosition = ref('end')
const stacked = ref(false)

const basicFields = ['name', 'email', 'phone', 'password', 'description']

const richFields = [
    { name: 'title', required: true, helper: 'Shown on the public page' },
    { name: 'amount', type: 'number', min: 0, step: 0.01 },
    { name: 'due_date' },
    { name: 'role_id', label: 'Role', options: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Editor' }] },
    { name: 'tags', type: 'suggest', multiple: true, allowCustom: true, options: [{ id: 'vue', name: 'Vue' }, { id: 'tw', name: 'Tailwind' }] }
]

const steps = [
    { title: 'Account', fields: ['name', 'email'] },
    { title: 'Security', fields: ['phone', 'password'] },
    { title: 'Profile', fields: ['description'] }
]
</script>

<template>
    <div class="mx-auto max-w-3xl space-y-10 p-8">
        <h1 class="text-2xl font-bold text-gray-900">sh-tailwind playground</h1>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Basic form (string fields, type inference)</h2>
            <ShForm action="demo/save" :fields="basicFields" success-message="Saved!" />
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Rich fields (select, suggest, number, date)</h2>
            <ShForm action="demo/rich" :fields="richFields" />
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Multi-step wizard</h2>
            <ShForm action="demo/wizard" :fields="basicFields" :steps="steps" submit-label="Create account" />
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Dialogs &amp; drawers</h2>
            <div class="flex flex-wrap gap-3">
                <button class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white" @click="dialogOpen = true">v-model dialog</button>
                <button class="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white" @click="staticDialog = true">Static dialog</button>
                <ShDialogBtn title="Inline trigger dialog" size="lg">
                    <template #trigger>ShDialogBtn</template>
                    <p class="text-sm text-gray-600">Opened via the inline trigger component.</p>
                </ShDialogBtn>
                <select v-model="drawerPosition" class="rounded-md border border-gray-300 px-2 py-1 text-sm">
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="top">top</option>
                    <option value="bottom">bottom</option>
                </select>
                <button class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white" @click="drawerOpen = true">Drawer</button>
                <ShDrawerBtn title="Inline drawer" position="start">
                    <template #trigger>ShDrawerBtn</template>
                    <p class="text-sm text-gray-600">Drawer via trigger component.</p>
                </ShDrawerBtn>
                <ShDialogForm
                    title="New user"
                    action="demo/users"
                    :fields="['name', 'email', 'phone']"
                    success-message="User created"
                >
                    <template #trigger>ShDialogForm</template>
                </ShDialogForm>
            </div>

            <ShDialog v-model:open="dialogOpen" title="Hello from ShDialog" size="md">
                <p class="text-sm text-gray-600">Escape, backdrop click and the X all close me. Body scroll is locked.</p>
                <button class="mt-4 rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white" @click="stacked = true">Stack another</button>
                <ShDialog v-model:open="stacked" title="Stacked dialog" size="sm">
                    <p class="text-sm text-gray-600">Escape closes only me (topmost) first.</p>
                </ShDialog>
                <template #footer="{ close }">
                    <button class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" @click="close()">Close</button>
                </template>
            </ShDialog>

            <ShDialog v-model:open="staticDialog" title="Static dialog" static>
                <p class="text-sm text-gray-600">Backdrop click pulses instead of closing. Use the X.</p>
            </ShDialog>

            <ShDrawer v-model:open="drawerOpen" :position="drawerPosition" title="Drawer">
                <p class="text-sm text-gray-600">Slides from {{ drawerPosition }}.</p>
            </ShDrawer>
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Actions</h2>
            <div class="flex gap-4">
                <ShConfirmAction url="demo/danger" title="Delete record?" message="This cannot be undone">
                    Confirm action
                </ShConfirmAction>
                <ShSilentAction url="demo/ping" success-message="Pinged!">
                    Silent action
                </ShSilentAction>
            </div>
        </section>
    </div>
</template>
