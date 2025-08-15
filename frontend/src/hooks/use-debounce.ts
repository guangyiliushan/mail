import { useCallback, useEffect, useRef } from "react";

/**
 * useDebouncedCallback
 * 返回一个带有防抖的回调函数，最后一次触发 delay 毫秒后执行。
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      clear();
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay, clear]
  );

  useEffect(() => clear, [clear]);

  return debounced;
}