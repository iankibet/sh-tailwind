// Token preset: the default theme rewritten on design tokens (bg-surface,
// text-fg, border-line, bg-primary, ...) defined by tokens.css, so the brand
// colour comes from one CSS variable and dark mode works by toggling `.dark`.
// Use: import '@iankibetsh/sh-tailwind/tokens.css' in your CSS, then
// app.use(ShTailwind, { preset: tokenTheme }).
export const tokenTheme = {
    form: {
        form: 'space-y-4',
        group: 'space-y-1',
        label: 'block text-sm font-medium text-fg-muted',
        required: 'text-red-500',
        input: 'block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-fg shadow-sm placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
        inputInvalid: 'block w-full rounded-md border border-red-500 bg-surface px-3 py-2 text-sm text-fg shadow-sm placeholder:text-fg-subtle focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30',
        helper: 'text-xs text-fg-subtle',
        error: 'text-xs text-red-600 dark:text-red-400',
        errorTitle: 'rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300',
        nav: 'flex items-center justify-end gap-3 pt-2',
        submitBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60',
        prevBtn: 'inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-line-strong',
        nextBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40',
        steps: {
            wrapper: 'mb-6 flex items-start',
            step: 'relative flex flex-1 flex-col items-center gap-1',
            circle: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-line-strong bg-surface text-sm font-semibold text-fg-subtle',
            circleActive: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-primary bg-primary text-sm font-semibold text-on-primary',
            circleDone: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-sm font-semibold text-white',
            title: 'text-xs text-fg-muted',
            titleActive: 'text-xs font-semibold text-primary',
            connector: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-line',
            connectorDone: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-emerald-500'
        }
    },
    inputs: {
        select: 'block w-full appearance-none rounded-md border border-line-strong bg-surface px-3 py-2 pr-8 text-sm text-fg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50',
        passwordWrapper: 'relative',
        passwordToggle: 'absolute inset-y-0 right-2 flex items-center text-fg-subtle hover:text-fg',
        pin: {
            wrapper: 'flex items-center gap-2',
            box: 'size-11 rounded-md border border-line-strong bg-surface text-center text-lg font-semibold text-fg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
            boxFilled: 'size-11 rounded-md border border-primary/60 bg-primary-soft text-center text-lg font-semibold text-fg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            boxInvalid: 'size-11 rounded-md border border-red-500 bg-surface text-center text-lg font-semibold text-fg shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
        },
        suggest: {
            wrapper: 'relative',
            badges: 'mb-1 flex flex-wrap gap-1',
            badge: 'inline-flex items-center gap-1 rounded-full bg-line px-2 py-0.5 text-xs text-fg-muted',
            badgeRemove: 'cursor-pointer text-fg-subtle hover:text-red-500',
            dropdown: 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-lg',
            option: 'cursor-pointer px-3 py-2 text-sm text-fg-muted hover:bg-muted',
            optionActive: 'cursor-pointer bg-primary-soft px-3 py-2 text-sm text-primary-strong',
            empty: 'px-3 py-2 text-sm text-fg-subtle'
        },
        phone: {
            wrapper: 'relative flex items-stretch rounded-md border border-line-strong bg-surface shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
            trigger: 'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-md border-r border-line bg-muted px-3 py-2 text-sm text-fg-muted hover:bg-line focus:outline-none',
            flag: 'text-base leading-none',
            dial: 'text-sm font-medium text-fg-muted',
            chevron: 'size-3.5 text-fg-subtle',
            input: 'block w-full rounded-r-md border-0 bg-transparent px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-0',
            dropdown: 'absolute left-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-lg border border-line bg-surface shadow-lg',
            search: 'block w-full border-0 border-b border-line bg-transparent px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-0',
            list: 'max-h-60 overflow-y-auto py-1',
            option: 'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-fg-muted hover:bg-muted',
            optionActive: 'flex w-full cursor-pointer items-center gap-2.5 bg-primary-soft px-3 py-2 text-left text-sm text-primary-strong',
            optionName: 'flex-1 truncate',
            optionDial: 'text-xs text-fg-subtle',
            empty: 'px-3 py-3 text-center text-sm text-fg-subtle'
        },
        range: {
            wrapper: 'relative inline-block text-left w-full md:w-auto',
            trigger: 'inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm cursor-pointer w-full md:w-auto justify-between',
            dropdown: 'absolute right-0 mt-2 z-20 w-80 rounded-2xl border border-line bg-surface p-4 shadow-xl focus:outline-none',
            presetsGrid: 'grid grid-cols-2 gap-1 mb-4',
            presetBtn: 'text-left px-3 py-2 text-xs rounded-lg font-medium transition cursor-pointer',
            presetBtnActive: 'bg-fg text-canvas',
            presetBtnInactive: 'text-fg-muted hover:bg-muted',
            customWrapper: 'border-t border-line pt-3',
            customTitle: 'text-xs font-semibold text-fg-subtle mb-2',
            customInputs: 'grid grid-cols-2 gap-2',
            customInputLabel: 'block text-[10px] font-bold text-fg-subtle uppercase',
            customInput: 'mt-1 block w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-xs text-fg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10',
            applyBtn: 'mt-3 w-full rounded-lg bg-fg py-2 text-xs font-semibold text-on-primary hover:opacity-90 transition cursor-pointer'
        }
    },
    dialog: {
        backdrop: 'fixed inset-0 bg-black/50 dark:bg-black/70',
        wrapper: 'fixed inset-0 flex items-center justify-center overflow-y-auto p-4',
        panel: 'relative flex max-h-[90vh] w-full flex-col rounded-xl bg-surface shadow-xl outline-none',
        header: 'flex items-center justify-between border-b border-line px-5 py-3.5',
        title: 'text-base font-semibold text-fg',
        closeBtn: 'rounded-md p-1 text-fg-subtle hover:bg-muted hover:text-fg focus:outline-none',
        body: 'overflow-y-auto px-5 py-4',
        footer: 'flex justify-end gap-2 border-t border-line px-5 py-3',
        sizes: {
            sm: 'max-w-sm',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'h-[95vh] max-w-[95vw]'
        }
    },
    drawer: {
        backdrop: 'fixed inset-0 bg-black/50 dark:bg-black/70',
        panel: 'fixed flex flex-col bg-surface shadow-xl outline-none',
        header: 'flex items-center justify-between border-b border-line px-5 py-3.5',
        title: 'text-base font-semibold text-fg',
        closeBtn: 'rounded-md p-1 text-fg-subtle hover:bg-muted hover:text-fg focus:outline-none',
        body: 'flex-1 overflow-y-auto px-5 py-4',
        sizes: {
            sm: 'max-w-xs',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-2xl',
            full: 'max-w-full'
        },
        sizesVertical: {
            sm: 'max-h-48',
            md: 'max-h-72',
            lg: 'max-h-96',
            xl: 'max-h-[60vh]',
            full: 'max-h-full'
        }
    },
    table: {
        wrapper: 'space-y-3',
        toolbar: 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        search: 'block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-fg shadow-sm placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:max-w-xs',
        exactLabel: 'inline-flex items-center gap-1.5 text-xs text-fg-subtle',
        rangeWrapper: 'flex items-center gap-2',
        rangeInput: 'rounded-md border border-line-strong px-2 py-1.5 text-sm text-fg-muted',
        offline: 'flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300',
        container: 'hidden overflow-x-auto rounded-lg border border-line md:block',
        table: 'w-full min-w-full divide-y divide-line text-sm',
        thead: 'bg-muted',
        th: 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-fg-subtle',
        sortBtn: 'inline-flex cursor-pointer items-center gap-1 uppercase hover:text-fg',
        tbody: 'divide-y divide-line bg-surface',
        tr: '',
        trClickable: 'cursor-pointer hover:bg-muted',
        td: 'px-4 py-2.5 text-fg-muted',
        money: 'font-semibold text-emerald-600 dark:text-emerald-400',
        empty: 'px-4 py-10 text-center text-sm text-fg-subtle',
        error: 'rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300',
        loading: 'flex justify-center px-4 py-10 text-fg-subtle',
        actionsCell: 'whitespace-nowrap px-4 py-2.5 text-right',
        actionBtn: 'ml-3 inline-flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline first:ml-0',
        checkbox: 'size-4 rounded border-line-strong text-primary focus:ring-primary',
        cards: 'space-y-3 md:hidden',
        card: 'rounded-lg border border-line bg-surface p-4',
        cardLabel: 'text-xs font-semibold uppercase tracking-wide text-fg-subtle',
        cardValue: 'mb-2 text-sm text-fg-muted',
        pagination: {
            wrapper: 'flex flex-col items-center justify-between gap-3 md:flex-row',
            info: 'text-xs text-fg-subtle',
            perPage: 'rounded-md border border-line-strong px-2 py-1 text-xs text-fg-muted',
            pages: 'flex items-center gap-1',
            pageBtn: 'inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line-strong text-xs text-fg-muted hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40',
            pageBtnActive: 'inline-flex size-8 items-center justify-center rounded-md border border-primary bg-primary text-xs font-semibold text-on-primary',
            ellipsis: 'px-1 text-xs text-fg-subtle',
            loadMore: 'inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg-muted hover:bg-muted disabled:opacity-60'
        },
        multiBar: 'fixed bottom-5 left-1/2 z-40 flex min-w-80 -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-line bg-surface p-3 shadow-lg',
        multiCount: 'inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-on-primary',
        multiBtn: 'inline-flex items-center justify-center gap-1 rounded-md border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary-strong hover:bg-primary-soft'
    },
    tabs: {
        nav: 'flex flex-wrap items-center gap-1 border-b border-line',
        tab: 'group relative -mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-fg-subtle hover:border-line-strong hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40',
        tabActive: 'group relative -mb-px inline-flex items-center gap-2 border-b-2 border-primary px-3 py-2 text-sm font-medium text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        icon: 'size-4 shrink-0',
        count: 'inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-fg-muted',
        countActive: 'inline-flex min-w-5 items-center justify-center rounded-full bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary-strong',
        panel: 'pt-4 focus:outline-none',
        empty: 'rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300',
        pills: {
            nav: 'flex flex-wrap items-center gap-1.5',
            tab: 'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-fg-muted hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40',
            tabActive: 'inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
        },
        boxed: {
            nav: 'flex flex-wrap items-center gap-1 border-b border-line',
            tab: 'inline-flex items-center gap-2 rounded-t-lg border border-transparent px-3.5 py-2 text-sm font-medium text-fg-subtle hover:bg-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40',
            tabActive: 'inline-flex items-center gap-2 -mb-px rounded-t-lg border border-line border-b-surface bg-surface px-3.5 py-2 text-sm font-medium text-primary focus:outline-none'
        }
    },
    buttons: {
        primary: 'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60',
        secondary: 'inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg-muted hover:bg-muted focus:outline-none',
        danger: 'inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40',
        link: 'inline-flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline'
    }
}
