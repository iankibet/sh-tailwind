<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useTheme } from '../../../theme/useTheme.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    selected: {
        type: String,
        default: 'This Month'
    },
    startYear: {
        type: Number,
        default: 2021
    },
    classes: Object
})

const emit = defineEmits(['update:modelValue', 'rangeSelected'])

const t = useTheme('inputs')

const isOpen = ref(false)
const dropdownRef = ref(null)
const selectedDate = ref(null)
const rangeLabel = ref('')
const activeLabel = ref('')
const customFrom = ref('')
const customTo = ref('')

const formatDate = (date, format = 'MM/DD/YYYY') => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    
    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`
    }
    return `${month}/${day}/${year}`
}

const formatHumanDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

// Range computations using native Date object
const getTodayRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getYesterdayRange = () => {
    const start = new Date()
    start.setDate(start.getDate() - 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setDate(end.getDate() - 1)
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getLastDaysRange = (days) => {
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getThisWeekRange = () => {
    const start = new Date()
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(start.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return [monday, sunday]
}

const getThisMonthRange = () => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getLastMonthRange = () => {
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date()
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getThisYearRange = () => {
    const start = new Date()
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getOneYearRange = () => {
    const start = new Date()
    start.setFullYear(start.getFullYear() - 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getAllTimeRange = (startYear) => {
    const start = new Date()
    start.setFullYear(startYear, 0, 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return [start, end]
}

const getYearRange = (year) => {
    const start = new Date(year, 0, 1, 0, 0, 0, 0)
    const end = new Date(year, 11, 31, 23, 59, 59, 999)
    return [start, end]
}

const presetRanges = [
    { label: 'Today', getValue: () => getTodayRange() },
    { label: 'Yesterday', getValue: () => getYesterdayRange() },
    { label: '7 Days', getValue: () => getLastDaysRange(7) },
    { label: 'This week', getValue: () => getThisWeekRange() },
    { label: 'This Month', getValue: () => getThisMonthRange() },
    { label: 'Last Month', getValue: () => getLastMonthRange() },
    { label: 'Last 30 days', getValue: () => getLastDaysRange(30) },
    { label: 'Last 60 days', getValue: () => getLastDaysRange(60) },
    { label: 'Last 90 days', getValue: () => getLastDaysRange(90) },
    { label: 'This Year', getValue: () => getThisYearRange() },
    { label: '1 Year', getValue: () => getOneYearRange() },
    { label: 'All Time', getValue: () => getAllTimeRange(props.startYear) }
]

const dates = ref([])

const setDate = (date, label) => {
    selectedDate.value = date
    activeLabel.value = label
    rangeLabel.value = `<strong>${label}</strong> <span class="text-xs text-slate-400">(${formatHumanDate(date[0])} - ${formatHumanDate(date[1])})</span>`
    
    const from = date[0]
    const to = date[1]
    const period = label.toString().toLowerCase().replaceAll(' ', '_')
    
    const payload = {
        from: formatDate(from, 'YYYY-MM-DD'),
        to: formatDate(to, 'YYYY-MM-DD'),
        period: period,
        fromDate: from,
        toDate: to,
        fromFormatted: formatDate(from, 'MM/DD/YYYY'),
        toFormatted: formatDate(to, 'MM/DD/YYYY'),
        query: `from=${formatDate(from, 'MM/DD/YYYY')}&to=${formatDate(to, 'MM/DD/YYYY')}&period=${period}`
    }
    
    emit('update:modelValue', payload)
    emit('rangeSelected', payload)
}

const selectPreset = (preset) => {
    setDate(preset.getValue(), preset.label)
    isOpen.value = false
}

const applyCustom = () => {
    if (!customFrom.value || !customTo.value) return
    const fromDate = new Date(customFrom.value)
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(customTo.value)
    toDate.setHours(23, 59, 59, 999)
    
    setDate([fromDate, toDate], 'Custom')
    isOpen.value = false
}

// Click outside handler
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    
    // Initialize dates list
    dates.value = [...presetRanges]
    
    let end = new Date().getFullYear()
    while (end >= props.startYear) {
        const year = end
        dates.value.push({
            label: String(year),
            getValue: () => getYearRange(year)
        })
        end--
    }
    
    // Determine initial selection
    let initialPreset = null
    if (props.modelValue && props.modelValue.period) {
        initialPreset = dates.value.find(d => d.label.toLowerCase().replaceAll(' ', '_') === props.modelValue.period)
    }
    
    if (!initialPreset && props.selected) {
        initialPreset = dates.value.find(d => d.label.toLowerCase() === props.selected.toLowerCase())
    }
    
    if (initialPreset) {
        setDate(initialPreset.getValue(), initialPreset.label)
    } else if (props.modelValue && props.modelValue.from && props.modelValue.to) {
        customFrom.value = props.modelValue.from
        customTo.value = props.modelValue.to
        applyCustom()
    } else {
        const fallback = dates.value.find(d => d.label === 'This Month') || dates.value[0]
        if (fallback) {
            setDate(fallback.getValue(), fallback.label)
        }
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (newVal) => {
    if (!newVal) return
    
    const currentFrom = selectedDate.value ? formatDate(selectedDate.value[0], 'YYYY-MM-DD') : null
    const currentTo = selectedDate.value ? formatDate(selectedDate.value[1], 'YYYY-MM-DD') : null
    
    if (newVal.from === currentFrom && newVal.to === currentTo && newVal.period === activeLabel.value.toLowerCase().replaceAll(' ', '_')) {
        return
    }
    
    if (newVal.period) {
        const preset = dates.value.find(d => d.label.toLowerCase().replaceAll(' ', '_') === newVal.period)
        if (preset) {
            const range = preset.getValue()
            selectedDate.value = range
            activeLabel.value = preset.label
            rangeLabel.value = `<strong>${preset.label}</strong> <span class="text-xs text-slate-400">(${formatHumanDate(range[0])} - ${formatHumanDate(range[1])})</span>`
            return
        }
    }
    
    if (newVal.from && newVal.to) {
        const fromDate = new Date(newVal.from)
        const toDate = new Date(newVal.to)
        selectedDate.value = [fromDate, toDate]
        activeLabel.value = 'Custom'
        rangeLabel.value = `<strong>Custom</strong> <span class="text-xs text-slate-400">(${formatHumanDate(fromDate)} - ${formatHumanDate(toDate)})</span>`
        customFrom.value = newVal.from
        customTo.value = newVal.to
    }
}, { deep: true })
</script>

<template>
    <div ref="dropdownRef" :class="t.range.wrapper" v-bind="$attrs">
        <button
            type="button"
            :class="t.range.trigger"
            @click="isOpen = !isOpen"
        >
            <span class="flex items-center gap-2 text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span v-html="rangeLabel"></span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <div v-if="isOpen" :class="t.range.dropdown">
                <div :class="t.range.presetsGrid">
                    <button
                        v-for="date in dates"
                        :key="date.label"
                        type="button"
                        :class="[t.range.presetBtn, date.label === activeLabel ? t.range.presetBtnActive : t.range.presetBtnInactive]"
                        @click="selectPreset(date)"
                    >
                        {{ date.label }}
                    </button>
                </div>
                
                <div :class="t.range.customWrapper">
                    <p :class="t.range.customTitle">Custom Range</p>
                    <div :class="t.range.customInputs">
                        <div>
                            <label :class="t.range.customInputLabel">From</label>
                            <input
                                v-model="customFrom"
                                type="date"
                                :class="t.range.customInput"
                            />
                        </div>
                        <div>
                            <label :class="t.range.customInputLabel">To</label>
                            <input
                                v-model="customTo"
                                type="date"
                                :class="t.range.customInput"
                            />
                        </div>
                    </div>
                    <button
                        v-if="customFrom && customTo"
                        type="button"
                        :class="t.range.applyBtn"
                        @click="applyCustom"
                    >
                        Apply Custom Range
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
