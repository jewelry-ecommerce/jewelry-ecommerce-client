import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Trả về một callback ổn định (stable reference) bao bọc `fn`.
 * Hàm bên trong luôn trỏ đến `fn` mới nhất từ render cuối cùng,
 * giúp tránh stale closure mà không cần thêm dependency vào useCallback.
 * Tự động dùng useLayoutEffect trên client, useEffect trên server (SSR-safe).
 * @param fn - Hàm cần wrap.
 * @returns Hàm có cùng signature nhưng luôn gọi phiên bản mới nhất của `fn`.
 */
const useEventCallback = <Fn extends Function>(fn: Fn): Fn => {
  var ref = useRef(fn);

  useIsomorphicLayoutEffect(function () {
    ref.current = fn;
  });

  return useCallback(
    function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return ref.current.apply(void 0, args);
    } as any,
    [],
  );
};

export default useEventCallback;
