import { ShCore } from '@iankibetsh/sh-core'
import { defaultTheme } from '../theme/defaultTheme.js'
import { SH_TW_THEME, SH_TW_COMPONENTS } from '../theme/keys.js'
import { deepMerge } from '../utils/deepMerge.js'

// Tailwind UI layer plugin: installs sh-core (API client, auth strategy,
// config, session, v-if-user-can) then provides the theme and input
// component overrides. Registers no routes in v1 (options.router reserved
// for a future Tailwind ShAuth).
export const ShTailwind = {
    install (app, options = {}) {
        ShCore.install(app, options)

        const theme = deepMerge(defaultTheme, options.theme ?? {})
        app.provide(SH_TW_THEME, theme)
        app.provide(SH_TW_COMPONENTS, options.formComponents ?? {})

        // Compat bridge for ecosystem components that inject the legacy keys
        app.provide('formComponents', options.formComponents ?? {})
        app.provide('shFormElementClasses', {
            formGroup: theme.form.group,
            formLabel: theme.form.label,
            formControl: theme.form.input,
            helperText: theme.form.helper,
            invalidFeedback: theme.form.error,
            formErrorTitle: theme.form.errorTitle,
            actionBtn: theme.form.submitBtn
        })
    }
}

export const createShTailwind = (options = {}) => ({
    install: (app) => ShTailwind.install(app, options)
})

export default ShTailwind
