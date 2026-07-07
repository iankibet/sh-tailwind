// Plugin + theming
export { ShTailwind, createShTailwind } from './plugin/ShTailwind.js'
export { defaultTheme } from './theme/defaultTheme.js'
export { SH_TW_THEME, SH_TW_COMPONENTS, SH_DIALOG_CONTEXT } from './theme/keys.js'
export { useTheme } from './theme/useTheme.js'

// Composables
export { useDialog } from './composables/useDialog.js'

// Form
export { default as ShForm } from './components/form/ShForm.vue'
export { default as ShFormSteps } from './components/form/ShFormSteps.vue'

// Overlays
export { default as ShDialog } from './components/overlay/ShDialog.vue'
export { default as ShDrawer } from './components/overlay/ShDrawer.vue'
export { default as ShDialogBtn } from './components/overlay/ShDialogBtn.vue'
export { default as ShDrawerBtn } from './components/overlay/ShDrawerBtn.vue'
export { default as ShDialogForm } from './components/overlay/ShDialogForm.vue'

// Table
export { default as ShTable } from './components/table/ShTable.vue'
export { default as ShTablePagination } from './components/table/ShTablePagination.vue'
export { useTableData } from './table/useTableData.js'
export { localQuery } from './table/localQuery.js'
export { default as shTableCache, clearTableCache } from './table/tableCache.js'

// Navigation
export { default as ShTabs } from './components/navigation/ShTabs.vue'

// Actions
export { default as ShConfirmAction } from './components/actions/ShConfirmAction.vue'
export { default as ShSilentAction } from './components/actions/ShSilentAction.vue'
export { default as ShSpinner } from './components/actions/ShSpinner.vue'

// Inputs (also used by the formComponents override mechanism)
export { default as TextInput } from './components/form/inputs/TextInput.vue'
export { default as TextAreaInput } from './components/form/inputs/TextAreaInput.vue'
export { default as EmailInput } from './components/form/inputs/EmailInput.vue'
export { default as PasswordInput } from './components/form/inputs/PasswordInput.vue'
export { default as PinInput } from './components/form/inputs/PinInput.vue'
export { default as MaskedInput } from './components/form/inputs/MaskedInput.vue'
export { applyMask, maskMoney, maskPattern } from './utils/mask.js'
export { default as NumberInput } from './components/form/inputs/NumberInput.vue'
export { default as DateInput } from './components/form/inputs/DateInput.vue'
export { default as SelectInput } from './components/form/inputs/SelectInput.vue'
export { default as PhoneInput } from './components/form/inputs/PhoneInput.vue'
export { default as ShSuggest } from './components/form/inputs/ShSuggest.vue'
export { default as ShRange } from './components/form/inputs/ShRange.vue'

// Data
export { default as countries } from './data/countries.js'
