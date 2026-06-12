<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { shApis } from '@iankibetsh/sh-core'
import countries from '../../../data/countries.js'
import { useTheme } from '../../../theme/useTheme.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: String,
    placeholder: { type: String, default: '712345678' },
    isInvalid: Boolean,
    disabled: Boolean,
    countryCode: { type: String, default: 'KE' },
    // opt-in backend lookup of the visitor country (GET sh-country-code)
    detectCountry: Boolean
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const t = useTheme('inputs')
const input = ref('')
const selectedCountry = ref(
    countries.find(c => c.isoCode === props.countryCode.toUpperCase()) ?? countries[0]
)

// Emoji flag from the ISO code - no image assets needed
const flagEmoji = computed(() =>
    selectedCountry.value.isoCode
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65))
        .join('')
)

const updateValue = () => {
    let phone = (input.value || '').replace(/^0/, '')
    emit('update:modelValue', phone ? selectedCountry.value.dialCode + phone : '')
}

const syncFromModel = (value) => {
    if (!value) {
        input.value = ''
        return
    }
    const country = countries.find(c => value.startsWith(c.dialCode))
    if (country) {
        selectedCountry.value = country
        input.value = value.replace(country.dialCode, '')
    } else {
        input.value = value
    }
}

watch(() => props.modelValue, syncFromModel)

onMounted(() => {
    syncFromModel(props.modelValue)
    if (props.detectCountry && !props.modelValue) {
        shApis.doGet('sh-country-code').then(res => {
            const iso = res.data?.countryCode
            const country = iso && countries.find(c => c.isoCode === iso.toUpperCase())
            if (country) {
                selectedCountry.value = country
            }
        }).catch(() => {})
    }
})
</script>

<template>
    <div :class="[t.phone.wrapper, isInvalid ? 'border-red-500 focus-within:ring-red-500/30' : '']">
        <div class="relative flex items-center">
            <span :class="t.phone.dial">{{ flagEmoji }} {{ selectedCountry.dialCode }}</span>
            <select
                v-model="selectedCountry"
                class="absolute inset-0 cursor-pointer opacity-0"
                :disabled="disabled"
                aria-label="Country code"
                @change="updateValue"
            >
                <option v-for="country in countries" :key="country.isoCode" :value="country">
                    {{ country.name }} ({{ country.dialCode }})
                </option>
            </select>
        </div>
        <input
            v-model="input"
            type="tel"
            :class="t.phone.input"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="updateValue"
            @focus="emit('clearValidationErrors')"
        >
    </div>
</template>
