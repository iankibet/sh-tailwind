<script setup>
import { ref } from 'vue'
import ShRange from '../components/form/inputs/ShRange.vue'
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
import ShPopups from '../components/overlay/ShPopups.vue'
import ShPopupLink from '../components/overlay/ShPopupLink.vue'
import { usePopups } from '../popups/usePopups.js'
import { useColorMode } from '../composables/useColorMode.js'
import { demoUsers } from './demoData.js'

// --- Colour mode + brand ------------------------------------------------------
const { mode, setMode } = useColorMode()
const primary = ref('#2563eb')
const setPrimary = (value) => document.documentElement.style.setProperty('--sh-primary', value)

// --- Popups -------------------------------------------------------------------
const popups = usePopups()
const lastClosed = ref(null)
popups.onClosed(info => { lastClosed.value = `${info.name} → ${info.reason}` })
const popupUserActions = [
    { label: 'Peek', popup: { comp: 'DemoUserCard', type: 'drawer', title: '{name}' } },
    { label: 'Edit', popup: { comp: 'DemoEditUser', title: 'Edit {name}' } }
]

// --- Standalone ShRange state ------------------------------------------------
const selectedRangeState = ref(null)

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
    inactive: 'bg-muted text-fg-muted',
    pending: 'bg-amber-100 text-amber-700'
}[status] ?? 'bg-muted text-fg-muted')
</script>

<template>
    <div class="mx-auto max-w-3xl space-y-10 p-8">
        <div class="sticky top-0 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface/90 p-3 backdrop-blur">
            <span class="text-sm font-semibold">Theme</span>
            <div class="inline-flex rounded-lg border border-line p-0.5">
                <button v-for="m in ['light', 'dark', 'system']" :key="m" type="button" class="rounded-md px-3 py-1 text-xs font-medium capitalize" :class="mode === m ? 'bg-primary text-on-primary' : 'text-fg-muted hover:bg-muted'" @click="setMode(m)">{{ m }}</button>
            </div>
            <label class="ml-auto inline-flex items-center gap-2 text-xs text-fg-muted">Primary <input v-model="primary" type="color" class="size-7 cursor-pointer rounded border border-line bg-transparent" @input="setPrimary(primary)"></label>
        </div>
        <h1 class="text-2xl font-bold text-fg">sh-tailwind playground</h1>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Basic form (string fields, type inference)</h2>
            <ShForm action="demo/save:addUser" :fields="basicFields" success-message="Saved!" />
        </section>

        <section class="space-y-6 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">PIN input (configurable digits)</h2>
            <div class="space-y-2">
                <p class="text-sm font-medium text-fg-muted">Standalone — 6-digit OTP</p>
                <PinInput v-model="otp" :length="6" />
                <p class="text-xs text-fg-subtle">value: {{ otp || '—' }}</p>
            </div>
            <div class="space-y-2">
                <p class="text-sm font-medium text-fg-muted">Standalone — 4-digit masked PIN</p>
                <PinInput v-model="securePin" :length="4" mask />
                <p class="text-xs text-fg-subtle">value: {{ securePin || '—' }}</p>
            </div>
            <div class="space-y-2">
                <p class="text-sm font-medium text-fg-muted">Inside a ShForm (type: 'pin', digits/mask)</p>
                <ShForm action="demo/pin" :fields="pinFields" submit-label="Verify" />
            </div>
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">ShTable — actions via direct <code>handler</code> callbacks</h2>
            <p class="text-sm text-fg-subtle">
                Search, sort and paginate run against mock data. Row actions call a callback directly
                (no <code>@event</code> wiring). Last action:
                <span class="font-medium text-fg">{{ lastEvent || '—' }}</span>
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
                has-range
            >
                <template #cell-status="{ value }">
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusClass(value)">
                        {{ value }}
                    </span>
                </template>
            </ShTable>
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Standalone ShRange Component</h2>
            <div class="flex flex-col gap-2">
                <p class="text-sm text-fg-subtle font-medium text-fg-muted">Allows selecting date ranges using presets or custom fields, returning range data dynamically.</p>
                <div class="w-full md:w-auto">
                    <ShRange v-model="selectedRangeState" />
                </div>
                <p class="text-xs font-semibold text-fg-muted mt-2">Bound state value:</p>
                <pre class="rounded-lg bg-muted p-3 text-xs text-fg overflow-auto max-h-40">{{ selectedRangeState }}</pre>
            </div>
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">ShTabs — slot content, counts, variants, keyboard nav</h2>
            <div class="flex items-center gap-2">
                <span class="text-sm text-fg-subtle">Variant:</span>
                <select v-model="tabVariant" class="rounded-md border border-line-strong px-2 py-1 text-sm">
                    <option value="underline">underline</option>
                    <option value="pills">pills</option>
                    <option value="boxed">boxed</option>
                </select>
                <span class="text-xs text-fg-subtle">active: {{ activeTab }} · last change: {{ tabChange || '—' }}</span>
            </div>
            <ShTabs
                v-model:tab="activeTab"
                :tabs="demoTabs"
                :variant="tabVariant"
                @change="(key) => (tabChange = key)"
            >
                <template #tab-overview>
                    <p class="text-sm text-fg-muted">Overview panel — arrow keys move between tabs, Home/End jump to ends.</p>
                </template>
                <template #tab-activity>
                    <p class="text-sm text-fg-muted">Activity panel with a count bubble (12).</p>
                </template>
                <template #tab-billing>
                    <p class="text-sm text-fg-muted">Billing panel — a zero count still renders its bubble.</p>
                </template>
            </ShTabs>
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Input masks (money, patterns)</h2>
            <p class="text-sm text-fg-subtle">Type freely — values auto-format. v-model receives the raw number for money, the formatted string for patterns.</p>
            <ShForm action="demo/mask" :fields="maskFields" submit-label="Save" />
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Rich fields (select, suggest, number, date)</h2>
            <ShForm action="demo/rich" :fields="richFields" />
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Multi-step wizard</h2>
            <ShForm action="demo/wizard" :fields="basicFields" :steps="steps" submit-label="Create account" />
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">Dialogs &amp; drawers</h2>
            <div class="flex flex-wrap gap-3">
                <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary" @click="dialogOpen = true">v-model dialog</button>
                <button class="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-on-primary" @click="staticDialog = true">Static dialog</button>
                <ShDialogBtn title="Inline trigger dialog" size="lg">
                    <template #trigger>ShDialogBtn</template>
                    <p class="text-sm text-fg-muted">Opened via the inline trigger component.</p>
                </ShDialogBtn>
                <select v-model="drawerPosition" class="rounded-md border border-line-strong px-2 py-1 text-sm">
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="top">top</option>
                    <option value="bottom">bottom</option>
                </select>
                <button class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-on-primary" @click="drawerOpen = true">Drawer</button>
                <ShDrawerBtn title="Inline drawer" position="start">
                    <template #trigger>ShDrawerBtn</template>
                    <p class="text-sm text-fg-muted">Drawer via trigger component.</p>
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
                <p class="text-sm text-fg-muted">Escape, backdrop click and the X all close me. Body scroll is locked.</p>
                <button class="mt-4 rounded-md bg-purple-600 px-3 py-1.5 text-sm text-on-primary" @click="stacked = true">Stack another</button>
                <ShDialog v-model:open="stacked" title="Stacked dialog" size="sm">
                    <p class="text-sm text-fg-muted">Escape closes only me (topmost) first.</p>
                </ShDialog>
                <template #footer="{ close }">
                    <button class="rounded-md border border-line-strong px-3 py-1.5 text-sm" @click="close()">Close</button>
                </template>
            </ShDialog>

            <ShDialog v-model:open="staticDialog" title="Static dialog" static>
                <p class="text-sm text-fg-muted">Backdrop click pulses instead of closing. Use the X.</p>
            </ShDialog>

            <ShDrawer v-model:open="drawerOpen" :position="drawerPosition" title="Drawer">
                <p class="text-sm text-fg-muted">Slides from {{ drawerPosition }}.</p>
            </ShDrawer>
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
            <h2 class="text-lg font-semibold">URL popups (ShPopups)</h2>
            <p class="text-sm text-fg-muted">Every popup below lives in the URL: refresh keeps it open, Back closes the top one, popups stack.</p>
            <div class="flex flex-wrap gap-3 text-sm">
                <ShPopupLink comp="DemoUserCard" type="drawer" title="User 3" :props="{ id: 3 }" class="rounded-md bg-emerald-600 px-4 py-2 font-medium text-on-primary">
                    ShPopupLink (drawer)
                </ShPopupLink>
                <button class="rounded-md bg-primary px-4 py-2 font-medium text-on-primary" @click="popups.open('DemoEditUser', { title: 'Edit user 7', props: { id: 7 } })">
                    usePopups().open() (lazy)
                </button>
                <a href="/?popup=modal&comp=ShQueryForm&title=New task&action=demo/tasks&fields=name,email,phone" class="rounded-md bg-gray-700 px-4 py-2 font-medium text-on-primary">
                    Legacy shframework link
                </a>
                <a href="/users/12/peek" class="rounded-md bg-purple-600 px-4 py-2 font-medium text-on-primary" @click.prevent="$router.push('/users/12/peek')">
                    Route meta popup
                </a>
                <ShPopupLink comp="NotRegistered" class="rounded-md border border-line-strong px-4 py-2">Unregistered name</ShPopupLink>
            </div>
            <p class="text-xs text-fg-subtle">Last closed: {{ lastClosed ?? '—' }}</p>
            <ShTable endpoint="demo/users" :columns="['id', 'name', 'email']" :actions="popupUserActions" :per-page="5" />
            <ShPopups />
        </section>

        <section class="space-y-4 rounded-xl border border-line bg-surface p-6">
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
