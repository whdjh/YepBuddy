import { useEffect, useRef } from "react"

/** 의존성이 연속으로 바뀌면 이전 예약을 취소하고, 마지막 변경 이후 delay가 지나면 effect를 한 번 실행 */
export function useDebouncedEffect(
  effect: () => void,
  delay: number,
  dependencies: readonly unknown[],
) {
  const effectRef = useRef(effect)
  effectRef.current = effect

  useEffect(() => {
    const timeout = setTimeout(() => {
      effectRef.current()
    }, delay)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...dependencies])
}
