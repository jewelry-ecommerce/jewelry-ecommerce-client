import { useRef, useEffect } from "react";

/**
 * Lưu lại giá trị của `value` từ render trước đó.
 * Hữu ích khi cần so sánh giá trị hiện tại với giá trị trước (ví dụ: phát hiện thay đổi props).
 * @param value - Giá trị cần theo dõi.
 * @returns Giá trị `value` của lần render trước.
 */
const usePrevious = <V extends any>(value: V) => {
  const ref = useRef<V>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePrevious;
