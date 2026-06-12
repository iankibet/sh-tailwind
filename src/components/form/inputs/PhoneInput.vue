<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const root = ref(null)
const searchEl = ref(null)
const input = ref('')
const open = ref(false)
const countrySearch = ref('')
const highlighted = ref(-1)
const selectedCountry = ref(
    countries.find(c => c.isoCode === props.countryCode.toUpperCase()) ?? countries[0]
)

// Emoji flags are computed from the ISO code - fully offline, no assets
const flagFor = (isoCode) =>
    String(isoCode ?? '')
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65))
        .join('')

const filteredCountries = computed(() => {
    const term = countrySearch.value.trim().toLowerCase()
    if (!term) {
        return countries
    }
    return countries.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.dialCode.includes(term) ||
        c.isoCode.toLowerCase().includes(term)
    )
})

const toggleDropdown = async () => {
    if (props.disabled) {
        return
    }
    open.value = !open.value
    if (open.value) {
        countrySearch.value = ''
        highlighted.value = -1
        await nextTick()
        searchEl.value?.focus()
    }
}

const pickCountry = (country) => {
    selectedCountry.value = country
    open.value = false
    updateValue()
}

const onSearchKeydown = (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        highlighted.value = Math.min(highlighted.value + 1, filteredCountries.value.length - 1)
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlighted.value = Math.max(highlighted.value - 1, 0)
    } else if (e.key === 'Enter') {
        e.preventDefault()
        const country = filteredCountries.value[Math.max(highlighted.value, 0)]
        if (country) {
            pickCountry(country)
        }
    } else if (e.key === 'Escape') {
        open.value = false
    }
}

const updateValue = () => {
    const phone = (input.value || '').replace(/^0/, '')
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

const onOutsidePointer = (e) => {
    if (root.value && !root.value.contains(e.target)) {
        open.value = false
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', onOutsidePointer)
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

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onOutsidePointer)
})
</script>

<template>
    <div ref="root" :class="[t.phone.wrapper, isInvalid ? 'border-red-500 focus-within:ring-red-500/30' : '']">
        <button
            type="button"
            :class="t.phone.trigger"
            :disabled="disabled"
            aria-haspopup="listbox"
            :aria-expanded="open"
            @click="toggleDropdown"
        >
            <span :class="t.phone.flag">{{ flagFor(selectedCountry.isoCode) }}</span>
            <span :class="t.phone.dial">{{ selectedCountry.dialCode }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" :class="t.phone.chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <input
            v-model="input"
            type="tel"
            :class="t.phone.input"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="updateValue"
            @focus="emit('clearValidationErrors')"
        >

        <div v-if="open" :class="t.phone.dropdown">
            <input
                ref="searchEl"
                v-model="countrySearch"
                type="text"
                :class="t.phone.search"
                placeholder="Search country or code..."
                @keydown="onSearchKeydown"
                @input="highlighted = 0"
            >
            <div :class="t.phone.list" role="listbox">
                <button
                    v-for="(country, index) in filteredCountries"
                    :key="country.isoCode"
                    type="button"
                    role="option"
                    :aria-selected="country.isoCode === selectedCountry.isoCode"
                    :class="index === highlighted ? t.phone.optionActive : t.phone.option"
                    @pointerdown.prevent="pickCountry(country)"
                    @mouseenter="highlighted = index"
                >
                    <span :class="t.phone.flag">{{ flagFor(country.isoCode) }}</span>
                    <span :class="t.phone.optionName">{{ country.name }}</span>
                    <span :class="t.phone.optionDial">{{ country.dialCode }}</span>
                </button>
                <p v-if="!filteredCountries.length" :class="t.phone.empty">No country matches "{{ countrySearch }}"</p>
            </div>
        </div>
    </div>
</template>
