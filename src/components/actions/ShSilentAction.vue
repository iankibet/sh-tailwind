<script setup>
import { ref } from 'vue'
import { shApis, shRepo } from '@iankibetsh/sh-core'
import { useTheme } from '../../theme/useTheme.js'
import ShSpinner from './ShSpinner.vue'

const props = defineProps({
    url: { type: String, required: true },
    data: Object,
    method: { type: String, default: 'POST' }, // GET | POST | PUT | DELETE
    loadingMessage: { type: String, default: 'Processing' },
    successMessage: { type: String, default: 'Action Successful' },
    failMessage: { type: String, default: 'Action failed' },
    disableSuccessMessage: Boolean,
    tag: { type: String, default: 'button' },
    btnClass: String
})

const emit = defineEmits([
    'success', 'failed',
    // legacy-compatible aliases
    'actionSuccessful', 'actionFailed'
])

const buttons = useTheme('buttons')
const processing = ref(false)

const methods = {
    GET: shApis.doGet,
    POST: shApis.doPost,
    PUT: shApis.doPut,
    DELETE: shApis.doDelete
}

function runAction () {
    processing.value = true
    const send = methods[props.method.toUpperCase()] ?? shApis.doPost
    send(props.url, props.data).then(res => {
        processing.value = false
        emit('actionSuccessful', res)
        emit('success', res)
        if (!props.disableSuccessMessage) {
            shRepo.showToast(res.data?.message ?? props.successMessage)
        }
    }).catch(reason => {
        processing.value = false
        emit('actionFailed', reason)
        emit('failed', reason)
        shRepo.showToast(reason?.message ?? props.failMessage, 'error')
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
