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
import ShTable from '../components/table/ShTable.vue'
import ShTabs from '../components/navigation/ShTabs.vue'
import PinInput from '../components/form/inputs/PinInput.vue'
import { demoUsers } from './demoData.js'

// --- ShTabs -----------------------------------------------------------------
const tabVariant = ref('underline')
const activeTab = ref(null)
const tabChange = ref('')
const demoTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity', count: 12 },
    { key: 'billing', label: 'Billing', count: 0 },
    { key: 'archived', label: 'Archived', disabled: true }
]

const dialogOpen = ref(false)
const staticDialog = ref(false)
const drawerOpen = ref(false)
const drawerPosition = ref('end')
const stacked = ref(false)

const otp = ref('')
const securePin = ref('')

const basicFields = ['name', 'email', 'phone', 'password', 'description']

const pinFields = [
    { name: 'otp', type: 'pin', label: 'One-time code', digits: 6, helper: '6-digit code sent to your phone' },
    { name: 'wallet_pin', type: 'pin', label: 'Wallet PIN', digits: 4, secret: true, helper: '4-digit secret PIN (masked)' }
]

const maskFields = [
    { name: 'amount', mask: 'money', label: 'Amount', helper: 'Auto-grouped thousands, 2 decimals' },
    { name: 'salary', mask: { type: 'money', prefix: 'KES ', decimals: 0 }, label: 'Salary (KES, no decimals)' },
    { name: 'card', mask: '#### #### #### ####', label: 'Card number' },
    { name: 'msisdn', mask: '(###) ###-####', label: 'Phone pattern' }
]

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

// --- ShTable ----------------------------------------------------------------
const tableRef = ref(null)
const lastEvent = ref('')

const userColumns = [
    { name: 'name' },
    { name: 'email', label: 'Email' },
    { name: 'amount', format: 'money' },
    { name: 'role' },
    { name: 'status' },                  // rendered via #cell-status slot
    { name: 'created_at', label: 'Joined', format: 'date' }
]

// Actions specify the callback DIRECTLY via `handler` (no @event wiring).
// handler receives the row; close over component state / refs as needed.
const userActions = [
    { label: 'View', handler: (row) => { lastEvent.value = `Viewed ${row.name}` } },
    { label: 'Promote', handler: (row) => { row.role = 'Manager'; lastEvent.value = `${row.name} → Manager` } },
    {
        label: 'Delete',
        class: 'text-red-600',
        handler: (row) => {
            lastEvent.value = `Deleted ${row.name}`
            const i = demoUsers.findIndex(u => u.id === row.id)
            if (i > -1) demoUsers.splice(i, 1)
            tableRef.value?.reload()       // refresh after mutating
        }
    }
]

// Bulk action — handler receives the array of selected rows.
const userMultiActions = [
    { label: 'Email selected', handler: (rows) => { lastEvent.value = `Emailing ${rows.length} user(s)` } }
]

const statusClass = (status) => ({
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    pending: 'bg-amber-100 text-amber-700'
}[status] ?? 'bg-gray-100 text-gray-600')
</script>

<template>
    <div class="mx-auto max-w-3xl space-y-10 p-8">
        <h1 class="text-2xl font-bold text-gray-900">sh-tailwind playground</h1>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Basic form (string fields, type inference)</h2>
            <ShForm action="demo/save:addUser" :fields="basicFields" success-message="Saved!" />
        </section>

        <section class="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">PIN input (configurable digits)</h2>
            <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Standalone — 6-digit OTP</p>
                <PinInput v-model="otp" :length="6" />
                <p class="text-xs text-gray-500">value: {{ otp || '—' }}</p>
            </div>
            <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Standalone — 4-digit masked PIN</p>
                <PinInput v-model="securePin" :length="4" mask />
                <p class="text-xs text-gray-500">value: {{ securePin || '—' }}</p>
            </div>
            <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Inside a ShForm (type: 'pin', digits/mask)</p>
                <ShForm action="demo/pin" :fields="pinFields" submit-label="Verify" />
            </div>
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">ShTable — actions via direct <code>handler</code> callbacks</h2>
            <p class="text-sm text-gray-500">
                Search, sort and paginate run against mock data. Row actions call a callback directly
                (no <code>@event</code> wiring). Last action:
                <span class="font-medium text-gray-800">{{ lastEvent || '—' }}</span>
            </p>
            <ShTable
                ref="tableRef"
                endpoint="demo/users"
                :columns="userColumns"
                :actions="userActions"
                :multi-actions="userMultiActions"
                :per-page="6"
                cache
                searchable
            >
                <template #cell-status="{ value }">
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusClass(value)">
                        {{ value }}
                    </span>
                </template>
            </ShTable>
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">ShTabs — slot content, counts, variants, keyboard nav</h2>
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">Variant:</span>
                <select v-model="tabVariant" class="rounded-md border border-gray-300 px-2 py-1 text-sm">
                    <option value="underline">underline</option>
                    <option value="pills">pills</option>
                    <option value="boxed">boxed</option>
                </select>
                <span class="text-xs text-gray-400">active: {{ activeTab }} · last change: {{ tabChange || '—' }}</span>
            </div>
            <ShTabs
                v-model:tab="activeTab"
                :tabs="demoTabs"
                :variant="tabVariant"
                @change="(key) => (tabChange = key)"
            >
                <template #tab-overview>
                    <p class="text-sm text-gray-600">Overview panel — arrow keys move between tabs, Home/End jump to ends.</p>
                </template>
                <template #tab-activity>
                    <p class="text-sm text-gray-600">Activity panel with a count bubble (12).</p>
                </template>
                <template #tab-billing>
                    <p class="text-sm text-gray-600">Billing panel — a zero count still renders its bubble.</p>
                </template>
            </ShTabs>
        </section>

        <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Input masks (money, patterns)</h2>
            <p class="text-sm text-gray-500">Type freely — values auto-format. v-model receives the raw number for money, the formatted string for patterns.</p>
            <ShForm action="demo/mask" :fields="maskFields" submit-label="Save" />
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
