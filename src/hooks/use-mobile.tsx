import * as React from "react"

const MOBILE_BREAKPOINT = 768
const CAN_HOVER_QUERY = "(hover: hover) and (pointer: fine)"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

function readCanHover(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(CAN_HOVER_QUERY).matches
}

/** Dispositivos com mouse/trackpad — hover confiável (não touch). */
export function useCanHover() {
  const [canHover, setCanHover] = React.useState(readCanHover)

  React.useEffect(() => {
    const mql = window.matchMedia(CAN_HOVER_QUERY)
    const onChange = () => setCanHover(mql.matches)
    mql.addEventListener("change", onChange)
    setCanHover(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return canHover
}

/** Touch / celular — usa tap em vez de hover. */
export function usePrefersTouch() {
  const canHover = useCanHover()
  return !canHover
}
