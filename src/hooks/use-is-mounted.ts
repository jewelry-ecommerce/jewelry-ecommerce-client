import { useCallback, useEffect, useRef } from "react";

/**
 * Trả về một hàm getter để kiểm tra component có còn đang mounted hay không.
 * Dùng để tránh setState trên component đã unmount (tránh memory leak).
 * @returns Hàm `() => boolean` — gọi để biết component có còn mounted.
 * @example
 * const isMounted = useIsMounted()
 * fetchData().then(data => { if (isMounted()) setState(data) })
 */
function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

export default useIsMounted;
