// Ref-counted body scroll lock so stacked overlays don't fight each other.
let locks = 0

export function lockScroll () {
    if (++locks === 1) {
        const gap = window.innerWidth - document.documentElement.clientWidth
        if (gap > 0) {
            document.body.style.paddingRight = `${gap}px`
        }
        document.body.style.overflow = 'hidden'
    }
}

export function unlockScroll () {
    if (locks > 0 && --locks === 0) {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
    }
}
