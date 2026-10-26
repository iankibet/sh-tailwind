import { computed, ref, onScopeDispose } from 'vue'
import { lockScroll, unlockScroll } from './useScrollLock.js'

const Z_BASE = 50
// Stack of open dialog instances; only the topmost reacts to Escape.
const openStack = []

// `isStatic()` returns true/false to force the behaviour, or undefined for
// "auto": the dialog is sticky (no backdrop/Escape close) while it holds a form.
export function useDialog ({ isStatic, onClose, onOpen } = {}) {
    const isOpen = ref(false)
    const zIndex = ref(Z_BASE)
    let restoreFocusEl = null

    const formCount = ref(0)
    const sticky = computed(() => isStatic?.() ?? formCount.value > 0)

    // ShForm calls this on mount; returns the matching unregister
    function registerForm () {
        formCount.value++
        let done = false
        return () => {
            if (!done) {
                done = true
                formCount.value--
            }
        }
    }

    // A click only counts as "outside" when the press also started outside:
    // dragging from an input (text selection) and releasing on the backdrop
    // fires a click on the backdrop, and so can password-manager overlays.
    let pressedOutside = false
    function onBackdropDown (e) {
        pressedOutside = e.target === e.currentTarget
    }
    function isBackdropClick (e) {
        const ok = pressedOutside && e.target === e.currentTarget
        pressedOutside = false
        return ok
    }

    const instance = {}

    const onKeydown = (e) => {
        if (e.key !== 'Escape') {
            return
        }
        if (openStack[openStack.length - 1] !== instance) {
            return
        }
        if (!sticky.value) {
            close('escape')
        }
    }

    function show () {
        if (isOpen.value) {
            return
        }
        restoreFocusEl = document.activeElement
        zIndex.value = Z_BASE + openStack.length * 10
        openStack.push(instance)
        isOpen.value = true
        lockScroll()
        document.addEventListener('keydown', onKeydown)
        onOpen?.()
    }

    function close (reason = 'api') {
        if (!isOpen.value) {
            return
        }
        isOpen.value = false
        const index = openStack.indexOf(instance)
        if (index >= 0) {
            openStack.splice(index, 1)
        }
        unlockScroll()
        document.removeEventListener('keydown', onKeydown)
        restoreFocusEl?.focus?.()
        onClose?.(reason)
    }

    function onBackdrop (e) {
        if (isBackdropClick(e) && !sticky.value) {
            close('backdrop')
        }
    }

    onScopeDispose(() => {
        if (isOpen.value) {
            close('unmount')
        }
    })

    return { isOpen, zIndex, sticky, show, close, onBackdrop, onBackdropDown, isBackdropClick, registerForm }
}
