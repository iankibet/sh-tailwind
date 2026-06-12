// Every value is a complete Tailwind utility string (never interpolated
// fragments) so consumers' @source extraction always finds the classes.
export const defaultTheme = {
    form: {
        form: 'space-y-4',
        group: 'space-y-1',
        label: 'block text-sm font-medium text-gray-700 dark:text-gray-200',
        required: 'text-red-500',
        input: 'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
        inputInvalid: 'block w-full rounded-md border border-red-500 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:bg-gray-800 dark:text-gray-100',
        helper: 'text-xs text-gray-500 dark:text-gray-400',
        error: 'text-xs text-red-600',
        errorTitle: 'rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300',
        nav: 'flex items-center justify-end gap-3 pt-2',
        submitBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60',
        prevBtn: 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200',
        nextBtn: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40',
        steps: {
            wrapper: 'mb-6 flex items-start',
            step: 'relative flex flex-1 flex-col items-center gap-1',
            circle: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm font-semibold text-gray-500 dark:border-gray-600 dark:bg-gray-800',
            circleActive: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-semibold text-white',
            circleDone: 'z-10 flex size-9 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-sm font-semibold text-white',
            title: 'text-xs text-gray-600 dark:text-gray-300',
            titleActive: 'text-xs font-semibold text-blue-600',
            connector: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-gray-200 dark:bg-gray-700',
            connectorDone: 'absolute top-4 right-1/2 -z-0 h-0.5 w-full bg-emerald-500'
        }
    },
    inputs: {
        select: 'block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
        passwordWrapper: 'relative',
        passwordToggle: 'absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
        suggest: {
            wrapper: 'relative',
            badges: 'mb-1 flex flex-wrap gap-1',
            badge: 'inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200',
            badgeRemove: 'cursor-pointer text-gray-500 hover:text-red-600',
            dropdown: 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800',
            option: 'cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
            optionActive: 'cursor-pointer bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-gray-700 dark:text-blue-300',
            empty: 'px-3 py-2 text-sm text-gray-400'
        },
        phone: {
            wrapper: 'flex items-stretch overflow-hidden rounded-md border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-gray-600',
            dial: 'border-r border-gray-300 bg-gray-50 px-2 py-2 text-sm text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200',
            input: 'block w-full border-0 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-gray-100'
        }
    },
    dialog: {
        backdrop: 'fixed inset-0 bg-black/50',
        wrapper: 'fixed inset-0 flex items-center justify-center overflow-y-auto p-4',
        panel: 'relative flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl outline-none dark:bg-gray-900',
        header: 'flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800',
        title: 'text-base font-semibold text-gray-900 dark:text-gray-100',
        closeBtn: 'rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-800',
        body: 'overflow-y-auto px-5 py-4',
        footer: 'flex justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800',
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
        panel: 'fixed flex flex-col bg-white shadow-xl outline-none dark:bg-gray-900',
        header: 'flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800',
        title: 'text-base font-semibold text-gray-900 dark:text-gray-100',
        closeBtn: 'rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-800',
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
    buttons: {
        primary: 'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60',
        secondary: 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200',
        danger: 'inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40',
        link: 'inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline'
    }
}
