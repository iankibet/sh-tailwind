<script setup>
import { computed } from 'vue'

const props = defineProps({
    meta: { type: Object, required: true }, // { total, per_page, current_page, last_page, from }
    perPage: Number,
    mode: { type: String, default: 'pages' }, // pages | loadMore
    loading: Boolean,
    theme: { type: Object, required: true } // theme.table.pagination
})
const emit = defineEmits(['page', 'perPage', 'loadMore'])

const shown = computed(() => {
    const end = Math.min(props.meta.current_page * props.meta.per_page, props.meta.total)
    return end
})

// Windowed page list: 1 ... around-current ... last
const pages = computed(() => {
    const last = props.meta.last_page
    const current = props.meta.current_page
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1)
    }
    const items = [1]
    if (current > 3) {
        items.push('...')
    }
    for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
        items.push(p)
    }
    if (current < last - 2) {
        items.push('...')
    }
    items.push(last)
    return items
})
</script>

<template>
    <div :class="theme.wrapper">
        <div :class="theme.info">
            Showing {{ shown }} of {{ meta.total }}
            <select
                :value="perPage"
                :class="theme.perPage"
                class="ml-2"
                @change="emit('perPage', Number($event.target.value))"
            >
                <option v-for="n in [10, 20, 30, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
            </select>
        </div>

        <button
            v-if="mode === 'loadMore'"
            type="button"
            :class="theme.loadMore"
            :disabled="loading || meta.current_page >= meta.last_page"
            @click="emit('loadMore')"
        >
            {{ meta.current_page >= meta.last_page ? 'All loaded' : 'Load more' }}
        </button>

        <div v-else :class="theme.pages">
            <button
                type="button"
                :class="theme.pageBtn"
                :disabled="meta.current_page <= 1"
                aria-label="Previous page"
                @click="emit('page', meta.current_page - 1)"
            >
                &lsaquo;
            </button>
            <template v-for="(p, i) in pages" :key="i">
                <span v-if="p === '...'" :class="theme.ellipsis">…</span>
                <button
                    v-else
                    type="button"
                    :class="p === meta.current_page ? theme.pageBtnActive : theme.pageBtn"
                    @click="emit('page', p)"
                >
                    {{ p }}
                </button>
            </template>
            <button
                type="button"
                :class="theme.pageBtn"
                :disabled="meta.current_page >= meta.last_page"
                aria-label="Next page"
                @click="emit('page', meta.current_page + 1)"
            >
                &rsaquo;
            </button>
        </div>
    </div>
</template>
