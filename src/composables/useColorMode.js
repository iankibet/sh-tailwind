import { computed, ref, watchEffect } from 'vue'

// Light / dark / system colour mode, shared app-wide (module singleton).
// Toggles the `dark` class on <html>, which tokens.css (and Tailwind's `dark:`
// variant it configures) keys off. The choice persists in localStorage.
// To avoid a light flash before Vue boots, add the inline snippet from
// documentation/theming.md to your HTML <head>.

export const COLOR_MODE_STORAGE_KEY = 'sh-color-mode'
const MODES = ['light', 'dark', 'system']
const isBrowser = typeof window !== 'undefined'

const read = () => {
    try {
        const saved = isBrowser && window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)
        return MODES.includes(saved) ? saved : 'system'
    } catch {
        return 'system'
    }
}

const mode = ref(read())
const systemDark = ref(false)
let started = false

const start = () => {
    if (started || !isBrowser) {
        return
    }
    started = true
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (media) {
        systemDark.value = media.matches
        media.addEventListener?.('change', (event) => { systemDark.value = event.matches })
    }
    watchEffect(() => {
        const dark = resolved.value === 'dark'
        document.documentElement.classList.toggle('dark', dark)
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    })
}

const resolved = computed(() => (mode.value === 'system' ? (systemDark.value ? 'dark' : 'light') : mode.value))

const setMode = (value) => {
    if (!MODES.includes(value)) {
        return
    }
    mode.value = value
    try {
        window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, value)
    } catch {
        // storage blocked: the choice still applies for this page view
    }
}

/**
 * @returns {{ mode: import('vue').Ref<'light'|'dark'|'system'>,
 *   resolved: import('vue').ComputedRef<'light'|'dark'>,
 *   setMode: (m: 'light'|'dark'|'system') => void, toggle: () => void }}
 */
export function useColorMode () {
    start()
    return {
        mode,
        resolved,
        setMode,
        // flips between light and dark (leaving "system")
        toggle: () => setMode(resolved.value === 'dark' ? 'light' : 'dark')
    }
}
