/**
 * Lưu một giá trị vào localStorage dưới dạng JSON string.
 * Bỏ qua nếu đang chạy trên server (SSR).
 * @param key  - Tên key trong localStorage.
 * @param item - Giá trị cần lưu (sẽ được JSON.stringify).
 */
export const saveLocalItem = (key: string, item: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Lấy giá trị từ localStorage và parse JSON.
 * Nếu parse thất bại thì trả về raw string. Trả về null khi SSR.
 * @param key - Tên key cần đọc.
 * @returns Giá trị đã parse hoặc null.
 */
export const getLocalItem = <R extends any>(key: string): R => {
  if (typeof window === "undefined") return null as any;
  try {
    return JSON.parse(localStorage.getItem(key) as string);
  } catch {
    return localStorage.getItem(key) as any;
  }
};

/**
 * Xoá một item khỏi localStorage theo key.
 * Bỏ qua nếu đang chạy trên server (SSR).
 * @param key - Tên key cần xoá.
 */
export const destroyLocalItem = (key: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};
/**
 * Xoá toàn bộ dữ liệu trong localStorage.
 * Bỏ qua nếu đang chạy trên server (SSR).
 */
export const clearLocal = () => {
  if (typeof window === "undefined") return;
  localStorage.clear();
};

/**
 * Lưu một giá trị vào sessionStorage dưới dạng JSON string.
 * Dữ liệu chỉ tồn tại trong phiên trình duyệt hiện tại.
 * @param key  - Tên key trong sessionStorage.
 * @param item - Giá trị cần lưu (sẽ được JSON.stringify).
 */
export const saveSessionItem = (key: string, item: any) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(item));
};

/**
 * Lấy giá trị từ sessionStorage và parse JSON.
 * Nếu parse thất bại thì trả về raw string. Trả về null khi SSR.
 * @param key - Tên key cần đọc.
 * @returns Giá trị đã parse hoặc null.
 */
export const getSessionItem = <R extends any>(key: string): R => {
  if (typeof window === "undefined") return null as any;
  try {
    return JSON.parse(sessionStorage.getItem(key) as string);
  } catch {
    return sessionStorage.getItem(key) as any;
  }
};

/**
 * Xoá một item khỏi sessionStorage theo key.
 * Bỏ qua nếu đang chạy trên server (SSR).
 * @param key - Tên key cần xoá.
 */
export const destroySessionItem = (key: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
};

/**
 * Xoá toàn bộ dữ liệu trong sessionStorage.
 * Bỏ qua nếu đang chạy trên server (SSR).
 */
export const clearSession = (key: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.clear();
};
