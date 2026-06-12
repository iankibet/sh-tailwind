import { ref, onScopeDispose } from 'vue'
import { lockScroll, unlockScroll } from './useScrollLock.js'

const Z_BASE = 50
// Stack of open dialog instances; only the topmost reacts to Escape.
const openStack = []

export function useDialog ({ isStatic, onClose, onOpen } = {}) {
    const isOpen = ref(false)
    const zIndex = ref(Z_BASE)
    let restoreFocusEl = null

    const instance = {}

    const onKeydown = (e) => {
        if (e.key !== 'Escape') {
            return
        }
        if (openStack[openStack.length - 1] !== instance) {
            return
        }
        if (!isStatic?.()) {
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

    function onBackdrop () {
        if (!isStatic?.()) {
            close('backdrop')
        }
    }

    onScopeDispose(() => {
        if (isOpen.value) {
            close('unmount')
        }
    })

    return { isOpen, zIndex, show, close, onBackdrop }
}
