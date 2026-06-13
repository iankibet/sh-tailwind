<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { shApis, shRepo } from '@iankibetsh/sh-core'
import { useTheme } from '../../theme/useTheme.js'
import { SH_TW_COMPONENTS, SH_DIALOG_CONTEXT } from '../../theme/keys.js'
import { normalizeFields } from '../../utils/normalizeField.js'
import ShFormSteps from './ShFormSteps.vue'
import ShSpinner from '../actions/ShSpinner.vue'
import TextInput from './inputs/TextInput.vue'
import TextAreaInput from './inputs/TextAreaInput.vue'
import EmailInput from './inputs/EmailInput.vue'
import PasswordInput from './inputs/PasswordInput.vue'
import PinInput from './inputs/PinInput.vue'
import MaskedInput from './inputs/MaskedInput.vue'
import NumberInput from './inputs/NumberInput.vue'
import DateInput from './inputs/DateInput.vue'
import SelectInput from './inputs/SelectInput.vue'
import PhoneInput from './inputs/PhoneInput.vue'
import ShSuggest from './inputs/ShSuggest.vue'

const props = defineProps({
    action: { type: String, required: true },
    method: { type: String, default: 'post' }, // post | put | patch | delete
    fields: { type: Array, required: true },   // strings or field objects
    currentData: Object,                       // prefill for edit flows
    steps: Array,                              // [{ title, fields: ['name', ...] }]
    submitLabel: { type: String, default: 'Submit' },
    successMessage: String,
    retainData: Boolean,
    // (data) => false aborts, object replaces payload, anything else proceeds
    preSubmit: Function,
    hiddenId: { type: Boolean, default: true },
    classes: Object,
    disabled: Boolean
})

const emit = defineEmits([
    'success', 'error', 'fieldChanged', 'preSubmit',
    // legacy-compatible aliases
    'formSubmitted', 'formError'
])

const t = useTheme('form', computed(() => props.classes))
const inputsTheme = useTheme('inputs')
const injectedComponents = inject(SH_TW_COMPONENTS, {})
const dialogContext = inject(SH_DIALOG_CONTEXT, null)

const builtins = {
    text: TextInput,
    textarea: TextAreaInput,
    email: EmailInput,
    password: PasswordInput,
    pin: PinInput,
    number: NumberInput,
    date: DateInput,
    select: SelectInput,
    phone: PhoneInput,
    suggest: ShSuggest
}

const formFields = ref([])
const errors = reactive({})
const submitting = ref(false)
const currentStep = ref(0)
const isDirty = ref(false)

const buildFields = () => {
    const normalized = normalizeFields(props.fields, props.currentData)
    if (props.hiddenId && props.currentData?.id && !normalized.some(f => f.name === 'id')) {
        normalized.push({ name: 'id', type: 'hidden', value: props.currentData.id })
    }
    formFields.value = normalized
}
buildFields()

watch(() => props.currentData, () => {
    // don't clobber values the user already edited
    if (!isDirty.value) {
        buildFields()
    }
}, { deep: true })

watch(() => props.fields, buildFields)

const formSteps = computed(() => {
    if (!props.steps?.length) {
        return [{ title: '', fields: formFields.value }]
    }
    return props.steps.map(step => ({
        title: step.title ?? '',
        fields: formFields.value.filter(f =>
            (step.fields ?? []).includes(f.name) || f.type === 'hidden'
        )
    }))
})

const isLastStep = computed(() => currentStep.value >= formSteps.value.length - 1)

const resolveComponent = (field) => {
    // a `mask` (string/object/function) auto-formats via MaskedInput,
    // except for pins (their `secret` flag is unrelated to formatting)
    if (field.mask && field.type !== 'pin') {
        return MaskedInput
    }
    return field.component ?? injectedComponents[field.type] ?? builtins[field.type] ?? builtins.text
}

const inputClass = (field) => {
    if (errors[field.name]) {
        return t.value.inputInvalid
    }
    return field.type === 'select' ? inputsTheme.value.select : t.value.input
}

const inputProps = (field) => ({
    placeholder: field.placeholder || undefined,
    disabled: props.disabled || field.disabled,
    ...(field.type === 'select' || field.type === 'suggest'
        ? {
            options: Array.isArray(field.options) ? field.options : undefined,
            url: Array.isArray(field.options) ? undefined : field.options?.url,
            multiple: field.multiple,
            allowCustom: field.allowCustom,
            optionTemplate: field.optionTemplate
        }
        : {}),
    ...(field.type === 'number' ? { min: field.min, max: field.max, step: field.step } : {}),
    ...(field.type === 'textarea' ? { rows: field.rows } : {}),
    ...(field.type === 'date' ? { withTime: field.withTime, min: field.min, max: field.max } : {}),
    ...(field.type === 'phone' ? { countryCode: field.countryCode, detectCountry: field.detectCountry } : {}),
    ...(field.type === 'pin' ? { length: field.length ?? field.digits, secret: field.secret } : {}),
    ...(field.mask && field.type !== 'pin' ? { mask: field.mask } : {}),
    ...(field.props ?? {})
})

const fieldChanged = (field, value) => {
    isDirty.value = true
    delete errors[field.name]
    const data = collectData()
    emit('fieldChanged', field.name, value, data)
}

const collectData = () => {
    const data = {}
    formFields.value.forEach(field => {
        if (field.value !== null && typeof field.value !== 'undefined') {
            data[field.name] = field.value
        }
    })
    return data
}

const clearValues = () => {
    formFields.value.forEach(field => {
        if (field.type !== 'hidden') {
            field.value = null
        }
    })
    isDirty.value = false
}

const goToErrorStep = () => {
    const errored = Object.keys(errors)
    if (!errored.length || !props.steps?.length) {
        return
    }
    const stepIndex = formSteps.value.findIndex(step =>
        step.fields.some(f => errored.includes(f.name))
    )
    if (stepIndex >= 0) {
        currentStep.value = stepIndex
    }
}

const submitForm = async () => {
    if (!isLastStep.value) {
        currentStep.value++
        return
    }
    Object.keys(errors).forEach(key => delete errors[key])
    let data = collectData()

    if (props.preSubmit) {
        const result = await props.preSubmit(data)
        if (result === false) {
            return
        }
        if (result && typeof result === 'object') {
            data = result
        }
    }
    emit('preSubmit', data)

    const methods = {
        post: shApis.doPost,
        put: shApis.doPut,
        patch: shApis.doPatch,
        delete: shApis.doDelete
    }
    const send = methods[props.method.toLowerCase()] ?? shApis.doPost

    submitting.value = true
    try {
        const res = await send(props.action, data)
        if (props.successMessage) {
            shRepo.showToast(props.successMessage)
        }
        emit('success', res.data)
        emit('formSubmitted', res.data)
        if (!props.retainData) {
            clearValues()
            currentStep.value = 0
        }
        dialogContext?.requestClose?.('success')
    } catch (reason) {
        if (reason.response?.status === 422) {
            const serverErrors = reason.response.data?.errors ?? {}
            Object.keys(serverErrors).forEach(key => {
                const value = serverErrors[key]
                errors[key] = Array.isArray(value) ? value[0] : value
            })
            goToErrorStep()
        } else {
            shRepo.showToast(reason.response?.data?.message ?? reason.message ?? 'Request failed', 'error')
        }
        emit('error', reason)
        emit('formError', reason)
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <form :class="t.form" @submit.prevent="submitForm">
        <ShFormSteps v-if="formSteps.length > 1" :steps="formSteps" :current="currentStep" />

        <template v-for="(step, stepIndex) in formSteps" :key="stepIndex">
            <div v-show="currentStep === stepIndex" class="space-y-4">
                <div v-for="field in step.fields" :key="field.name" :class="field.type === 'hidden' ? '' : t.group">
                    <input v-if="field.type === 'hidden'" v-model="field.value" type="hidden">
                    <template v-else>
                        <label v-if="field.label" :class="t.label">
                            {{ field.label }} <span v-if="field.required" :class="t.required">*</span>
                        </label>
                        <component
                            :is="resolveComponent(field)"
                            v-model="field.value"
                            v-bind="inputProps(field)"
                            :is-invalid="!!errors[field.name]"
                            :class="[inputClass(field), field.class]"
                            @update:model-value="value => fieldChanged(field, value)"
                            @clear-validation-errors="delete errors[field.name]"
                        />
                        <p v-if="field.helper" :class="t.helper" v-html="field.helper" />
                        <p v-if="errors[field.name]" :class="t.error">{{ errors[field.name] }}</p>
                    </template>
                </div>
            </div>
        </template>

        <slot />

        <div :class="t.nav">
            <button
                v-if="currentStep > 0"
                type="button"
                :class="t.prevBtn"
                @click="currentStep--"
            >
                Back
            </button>
            <button
                type="submit"
                :class="isLastStep ? t.submitBtn : t.nextBtn"
                :disabled="submitting || disabled"
            >
                <ShSpinner v-if="submitting" class="size-4" />
                {{ isLastStep ? submitLabel : 'Next' }}
            </button>
        </div>
    </form>
</template>
