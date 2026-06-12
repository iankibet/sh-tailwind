<script setup>
import { ref } from 'vue'
import { shRepo } from '@iankibetsh/sh-core'
import { useTheme } from '../../theme/useTheme.js'
import ShSpinner from './ShSpinner.vue'

const props = defineProps({
    url: { type: String, required: true },
    data: Object,
    title: String,
    message: String,
    loadingMessage: { type: String, default: 'Processing...' },
    successMessage: { type: String, default: 'Action Successful' },
    failMessage: { type: String, default: 'Action failed' },
    tag: { type: String, default: 'button' },
    btnClass: String
})

const emit = defineEmits([
    'success', 'failed', 'canceled',
    // legacy-compatible aliases
    'actionSuccessful', 'actionFailed', 'actionCanceled'
])

const buttons = useTheme('buttons')
const processing = ref(false)

const actionSuccessful = (res) => {
    processing.value = false
    emit('actionSuccessful', res)
    emit('success', res)
    if (props.successMessage || res?.message) {
        shRepo.showToast(res?.message ?? props.successMessage)
    }
}

const actionFailed = (reason) => {
    processing.value = false
    emit('actionFailed', reason)
    emit('failed', reason)
    if (props.failMessage || reason?.value?.message) {
        shRepo.showToast(reason?.value?.message ?? props.failMessage, 'error')
    }
}

function runAction () {
    processing.value = true
    shRepo.runPlainRequest(props.url, props.message, props.title, props.data).then(res => {
        if (res.isConfirmed) {
            if (res.value?.success) {
                actionSuccessful(res.value.response)
            } else {
                actionFailed(res)
            }
        } else {
            processing.value = false
            emit('actionCanceled')
            emit('canceled')
        }
    }).catch(ex => {
        actionFailed(ex)
    })
}
</script>

<template>
    <component
        :is="tag"
        :class="[btnClass ?? buttons.link, processing ? 'pointer-events-none opacity-60' : '']"
        @click="runAction"
    >
        <template v-if="processing">
            <ShSpinner class="size-4" />
            <span>{{ loadingMessage }}</span>
        </template>
        <slot v-else />
    </component>
</template>
