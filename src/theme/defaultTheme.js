// Every value is a complete Tailwind utility string (never interpolated
// fragments) so consumers' @source extraction always finds the classes.
export const defaultTheme = {
    form: {
        form: 'space-y-4',
        group: 'space-y-1',
        label: 'block text-sm font-medium text-gray-700',
        required: 'text-red-500',
        input: 'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50',
        inputInvalid: 'block w-full rounded-md border border-red-500 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30',
        helper: 'text-xs text-gray-500',
        error: 'text-xs text-red-600',
        errorTitle: 'rounded-md bg-red-50 px-4 py-3 text-sm text-red-700',
        nav: 'flex items-center justify-end gap-3 pt-2',
        submitBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60',
        prevBtn: 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300',
        nextBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40',
        steps: {
            wrapper: 'mb-6 flex items-start',
            step: 'relative flex flex-1 flex-col items-center gap-1',
            circle: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm font-semibold text-gray-500',
            circleActive: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-semibold text-white',
            circleDone: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-sm font-semibold text-white',
            title: 'text-xs text-gray-600',
            titleActive: 'text-xs font-semibold text-blue-600',
            connector: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-gray-200',
            connectorDone: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-emerald-500'
        }
    },
    inputs: {
        select: 'block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50',
        passwordWrapper: 'relative',
        passwordToggle: 'absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600',
        pin: {
            wrapper: 'flex items-center gap-2',
            box: 'size-11 rounded-md border border-gray-300 bg-white text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50',
            boxFilled: 'size-11 rounded-md border border-blue-400 bg-blue-50 text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
            boxInvalid: 'size-11 rounded-md border border-red-500 bg-white text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
        },
        suggest: {
            wrapper: 'relative',
            badges: 'mb-1 flex flex-wrap gap-1',
            badge: 'inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700',
            badgeRemove: 'cursor-pointer text-gray-500 hover:text-red-600',
            dropdown: 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg',
            option: 'cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100',
            optionActive: 'cursor-pointer bg-blue-50 px-3 py-2 text-sm text-blue-700',
            empty: 'px-3 py-2 text-sm text-gray-400'
        },
        phone: {
            wrapper: 'relative flex items-stretch rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30',
            trigger: 'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-md border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none',
            flag: 'text-base leading-none',
            dial: 'text-sm font-medium text-gray-600',
            chevron: 'size-3.5 text-gray-400',
            input: 'block w-full rounded-r-md border-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0',
            dropdown: 'absolute left-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
            search: 'block w-full border-0 border-b border-gray-100 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0',
            list: 'max-h-60 overflow-y-auto py-1',
            option: 'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100',
            optionActive: 'flex w-full cursor-pointer items-center gap-2.5 bg-blue-50 px-3 py-2 text-left text-sm text-blue-700',
            optionName: 'flex-1 truncate',
            optionDial: 'text-xs text-gray-400',
            empty: 'px-3 py-3 text-center text-sm text-gray-400'
        },
        range: {
            wrapper: 'relative inline-block text-left w-full md:w-auto',
            trigger: 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm cursor-pointer w-full md:w-auto justify-between',
            dropdown: 'absolute right-0 mt-2 z-20 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl focus:outline-none',
            presetsGrid: 'grid grid-cols-2 gap-1 mb-4',
            presetBtn: 'text-left px-3 py-2 text-xs rounded-lg font-medium transition cursor-pointer',
            presetBtnActive: 'bg-slate-900 text-white',
            presetBtnInactive: 'text-slate-600 hover:bg-slate-50',
            customWrapper: 'border-t border-slate-100 pt-3',
            customTitle: 'text-xs font-semibold text-slate-400 mb-2',
            customInputs: 'grid grid-cols-2 gap-2',
            customInputLabel: 'block text-[10px] font-bold text-slate-400 uppercase',
            customInput: 'mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10',
            applyBtn: 'mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer'
        }
    },
    dialog: {
        backdrop: 'fixed inset-0 bg-black/50',
        wrapper: 'fixed inset-0 flex items-center justify-center overflow-y-auto p-4',
        panel: 'relative flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl outline-none',
        header: 'flex items-center justify-between border-b border-gray-100 px-5 py-3.5',
        title: 'text-base font-semibold text-gray-900',
        closeBtn: 'rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none',
        body: 'overflow-y-auto px-5 py-4',
        footer: 'flex justify-end gap-2 border-t border-gray-100 px-5 py-3',
        sizes: {
            sm: 'max-w-sm',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'h-[95vh] max-w-[95vw]'
        }
    },
    drawer: {
        backdrop: 'fixed inset-0 bg-black/50',
        panel: 'fixed flex flex-col bg-white shadow-xl outline-none',
        header: 'flex items-center justify-between border-b border-gray-100 px-5 py-3.5',
        title: 'text-base font-semibold text-gray-900',
        closeBtn: 'rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none',
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
        search: 'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 md:max-w-xs',
        exactLabel: 'inline-flex items-center gap-1.5 text-xs text-gray-500',
        rangeWrapper: 'flex items-center gap-2',
        rangeInput: 'rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700',
        offline: 'flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700',
        container: 'hidden overflow-x-auto rounded-lg border border-gray-200 md:block',
        table: 'w-full min-w-full divide-y divide-gray-200 text-sm',
        thead: 'bg-gray-50',
        th: 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
        sortBtn: 'inline-flex cursor-pointer items-center gap-1 uppercase hover:text-gray-800',
        tbody: 'divide-y divide-gray-100 bg-white',
        tr: '',
        trClickable: 'cursor-pointer hover:bg-gray-50',
        td: 'px-4 py-2.5 text-gray-700',
        money: 'font-semibold text-emerald-600',
        empty: 'px-4 py-10 text-center text-sm text-gray-400',
        error: 'rounded-md bg-red-50 px-4 py-3 text-sm text-red-700',
        loading: 'flex justify-center px-4 py-10 text-gray-400',
        actionsCell: 'whitespace-nowrap px-4 py-2.5 text-right',
        actionBtn: 'ml-3 inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline first:ml-0',
        checkbox: 'size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
        cards: 'space-y-3 md:hidden',
        card: 'rounded-lg border border-gray-200 bg-white p-4',
        cardLabel: 'text-xs font-semibold uppercase tracking-wide text-gray-400',
        cardValue: 'mb-2 text-sm text-gray-700',
        pagination: {
            wrapper: 'flex flex-col items-center justify-between gap-3 md:flex-row',
            info: 'text-xs text-gray-500',
            perPage: 'rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600',
            pages: 'flex items-center gap-1',
            pageBtn: 'inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40',
            pageBtnActive: 'inline-flex size-8 items-center justify-center rounded-md border border-blue-600 bg-blue-600 text-xs font-semibold text-white',
            ellipsis: 'px-1 text-xs text-gray-400',
            loadMore: 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60'
        },
        multiBar: 'fixed bottom-5 left-1/2 z-40 flex min-w-80 -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-lg',
        multiCount: 'inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white',
        multiBtn: 'inline-flex items-center justify-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50'
    },
    tabs: {
        nav: 'flex flex-wrap items-center gap-1 border-b border-gray-200',
        tab: 'group relative -mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-40',
        tabActive: 'group relative -mb-px inline-flex items-center gap-2 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        icon: 'size-4 shrink-0',
        count: 'inline-flex min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-600',
        countActive: 'inline-flex min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700',
        panel: 'pt-4 focus:outline-none',
        empty: 'rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700',
        pills: {
            nav: 'flex flex-wrap items-center gap-1.5',
            tab: 'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-40',
            tabActive: 'inline-flex items-center gap-2 rounded-full bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40'
        },
        boxed: {
            nav: 'flex flex-wrap items-center gap-1 border-b border-gray-200',
            tab: 'inline-flex items-center gap-2 rounded-t-lg border border-transparent px-3.5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-40',
            tabActive: 'inline-flex items-center gap-2 -mb-px rounded-t-lg border border-gray-200 border-b-white bg-white px-3.5 py-2 text-sm font-medium text-blue-600 focus:outline-none'
        }
    },
    buttons: {
        primary: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60',
        secondary: 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none',
        danger: 'inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40',
        link: 'inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline'
    }
}
