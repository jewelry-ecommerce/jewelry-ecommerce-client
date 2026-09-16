import { useEffect, useState } from "react";

type UseDebounceProps = {
  value: any;
  delay: number;
};

/**
 * Trì hoãn cập nhật giá trị `value` cho đến khi ngừng thay đổi trong khoảng `delay` ms.
 * Thường dùng cho ô tìm kiếm / input để tránh gọi API quá nhiều lần.
 * @param value - Giá trị cần debounce.
 * @param delay - Thời gian chờ (milliseconds).
 * @returns Giá trị sau khi đã được debounce.
 */
const useDebounce = (props: UseDebounceProps) => {
  const { delay, value } = props;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
