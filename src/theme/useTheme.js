import { computed, inject, unref } from 'vue'
import { SH_TW_THEME } from './keys.js'
import { defaultTheme } from './defaultTheme.js'
import { deepMerge } from '../utils/deepMerge.js'

// Resolves one theme section with optional per-instance overrides.
// Precedence: instance overrides > plugin theme > defaults.
export function useTheme (section, overrides = null) {
    const theme = inject(SH_TW_THEME, defaultTheme)
    return computed(() => deepMerge(theme[section] ?? defaultTheme[section], unref(overrides) ?? {}))
}
