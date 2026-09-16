/**
 * Đăng ký lắng nghe một custom event trên `document`.
 * Khi event được kích hoạt, `callback` nhận vào (data, resolve, reject) từ event detail.
 * @param event - Tên event cần lắng nghe.
 * @param callback - Hàm xử lý khi event được dispatch.
 */
const listenerStore = new Map<string, WeakMap<(...args: any[]) => void, EventListener>>();

export const on = (event: string, callback: (...args: any[]) => void) => {
  const wrapped: EventListener = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail?.data, customEvent.detail?.resolve, customEvent.detail?.reject);
  };

  let eventMap = listenerStore.get(event);
  if (!eventMap) {
    eventMap = new WeakMap();
    listenerStore.set(event, eventMap);
  }

  eventMap.set(callback, wrapped);
  document.addEventListener(event, wrapped);
};
/**
 * Phát đi (dispatch) một custom event trên `document` kèm dữ liệu.
 * Không trả về kết quả – dùng cho các thông báo một chiều.
 * @param event - Tên event cần dispatch.
 * @param data  - Dữ liệu đính kèm, sẽ nằm trong `e.detail.data`.
 */
export const dispatch = (event: string, data?: any) => {
  document.dispatchEvent(new CustomEvent(event, { detail: { data } }));
};
/**
 * Phát đi một custom event và trả về Promise.
 * Bên lắng nghe (on) có thể gọi `resolve` hoặc `reject` để hoàn thành Promise này.
 * Dùng cho các luồng yêu cầu phản hồi (request-response qua EventBus).
 * @param event - Tên event cần dispatch.
 * @param data  - Dữ liệu đính kèm.
 * @returns Promise chờ bên nhận resolve/reject.
 */
export const asyncDispatch = (event: string, data?: any) => {
  return new Promise((resolve, reject) => {
    document.dispatchEvent(new CustomEvent(event, { detail: { data, resolve, reject } }));
  });
};
/**
 * Huỷ đăng ký lắng nghe một custom event khỏi `document`.
 * Cần truyền đúng tham chiếu `callback` đã dùng khi gọi `on`.
 * @param event    - Tên event cần gỡ bỏ.
 * @param callback - Hàm handler đã đăng ký trước đó.
 */
export const remove = (event: string, callback: (...args: any[]) => void) => {
  const eventMap = listenerStore.get(event);
  const wrapped = eventMap?.get(callback);
  if (!wrapped) return;
  document.removeEventListener(event, wrapped);
};
