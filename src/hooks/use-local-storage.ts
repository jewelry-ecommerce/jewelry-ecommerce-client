import { useCallback, useState } from "react";
import _isEqual from "lodash/isEqual";

import { storageService } from "@/services";

export type UseLocalStorage<T = any> = {
  key: string;
  initialValue: T;
};

/**
 * Hook đồng bộ state với localStorage.
 * - Khởi tạo giá trị từ localStorage nếu đã có, ngược lại dùng `initialValue`.
 * - Setter chỉ cập nhật nếu giá trị thực sự thay đổi (deep-equal).
 * @param key          - Key trong localStorage.
 * @param initialValue - Giá trị mặc định nếu localStorage chưa có.
 * @returns Tuple `[storedValue, setValue]` — tương tự useState.
 */
const useLocalStorage = <T extends any = any>(props: UseLocalStorage<T>): [T, (value: T) => void] => {
  const { key, initialValue } = props;

  const [storedValue, setStoredValue] = useState<T>(() => storageService.getLocalItem<T>(key) || initialValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (value: T) => {
      if (!_isEqual(storedValue, value)) {
        setStoredValue(value);
        storageService.saveLocalItem(key, value);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
