<script setup>
import { useTheme } from '../../theme/useTheme.js'

defineProps({
    steps: { type: Array, required: true }, // [{ title }]
    current: { type: Number, default: 0 }
})

const theme = useTheme('form')
</script>

<template>
    <div :class="theme.steps.wrapper">
        <div v-for="(step, index) in steps" :key="index" :class="theme.steps.step">
            <div
                v-if="index > 0"
                :class="index <= current ? theme.steps.connectorDone : theme.steps.connector"
            />
            <div
                :class="index < current ? theme.steps.circleDone : (index === current ? theme.steps.circleActive : theme.steps.circle)"
            >
                <svg v-if="index < current" xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                <template v-else>{{ index + 1 }}</template>
            </div>
            <span :class="index === current ? theme.steps.titleActive : theme.steps.title">{{ step.title }}</span>
        </div>
    </div>
</template>
