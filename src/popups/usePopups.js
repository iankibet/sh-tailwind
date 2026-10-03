import { inject } from 'vue'
import { SH_TW_POPUPS, SH_POPUP_CONTEXT } from '../theme/keys.js'

// App-wide popup controls: open(name, { type, title, size, side, static,
// props, onClose }), close(result), closeAll(), location()/href() for links,
// onClosed(fn), register(name, component | loader), and the reactive `stack`.
export function usePopups () {
    const popups = inject(SH_TW_POPUPS, null)
    if (!popups) {
        throw new Error('[sh-tailwind] usePopups() needs the ShTailwind plugin installed')
    }
    return popups
}

// Inside a popup component: { close(result), layer } — layer.params holds every
// raw URL value, including ones the component didn't declare as props.
// null when the component isn't rendered as a popup.
export const usePopupContext = () => inject(SH_POPUP_CONTEXT, null)
