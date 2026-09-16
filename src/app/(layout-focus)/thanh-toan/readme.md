thêm api : curl -X 'POST' \
'https://test.gateway-internal.trading.local/api/order/orders/warehouses/nearest' \
-H 'accept: _/_' \
-H 'Content-Type: application/json' \
-H 'x-tenant-code: 3434534zvzxc5' \
-d '{
"items": [
{
"variationId": "string",
"sku": "string",
"quantity": 1
}
],
"shippingAddress": {
"phone": "string",
"wardCode": 0,
"wardName": "string",
"addressLine": "string",
"provinceCode": 0,
"provinceName": "string"
}
}'
đây là data trả về : {
"phone": "0900000000",
"wardCode": 1003580,
"wardName": "Thu Duc",
"addressLine": "200, Nguyen Van Ba, Thu Duc, TP Ho Chi Minh",
"warehouseId": "7f9c6f39-1b6d-4d65-9f34-2e5a9d2d8c10",
"provinceCode": 79,
"provinceName": "TP Ho Chi Minh",
"warehouseName": "Kho 1"
}
và api này : curl -X 'POST' \
'https://test.gateway-internal.trading.local/api/order/orders/services/with-leadtime' \
-H 'accept: _/_' \
-H 'Content-Type: application/json' \
-H 'x-tenant-code: 3434534zvzxc5' \
-d '{
"shopId": 0,
"fromWardIdV2": 0,
"fromAddressV2": "string",
"toWardIdV2": 0,
"toAddressV2": "string",
"totalWeightGrams": 0,
"fromDistrictId": 0,
"fromWardCode": "string",
"toDistrictId": 0,
"toWardCode": "string"
}'
data trả về có interface : export interface IOrderShippingServiceItem {
serviceId?: number;
serviceTypeId?: number;
shortName?: string;
serviceName?: string;
service_id?: number;
service_type_id?: number;
short_name?: string;
service_name?: string;
expectedDeliveryTime?: string;
leadtime?:
| number
| {
leadtime?: number;
leadtime_order?: {
from_estimate_date?: string;
to_estimate_date?: string;
};
};
expected_delivery_time?: string;
totalFee?: number;
fee?: number;
total_fee?: number;
}

- chỉnh sửa page checkout
- thêm require cho tỉnh/thành phố , phường xã , địa chỉ cụ thể , sdt
- khi người dùng điền xong địa chỉ thì sẽ call api này warehouses/nearest để lấy kho gần nhất -> khi có kho gần nhất rồi thì dựa vào 2 thông tin đó lại call api /with-leadtime với các tham số api này cần , riêng tham số totalWeightGrams thì sẽ là tổng weightGram của tất cả item trong api getCheckoutSession cộng lại
- sau đó khi có data từ /with-leadtime trả về thì lấy item đầu tiên gắn các value của data này trả về vào body gửi xuống khi bấm checkouts
