-tạo 3 file : api , interface , index.ts

- api :
  /api/iam/customer/send-otp-register
  Request body
  {
  "phone": "0123456789"
  }
  res : {
  "success": true,
  "message": "Đã gửi mã OTP tới SĐT"
  }
  api :
  curl -X 'POST' \
  'https://dev.admin.trading.sevago.local/api/iam/customer/verify-otp-register' \
  -H 'accept: _/_' \
  -H 'Content-Type: application/json' \
  -d '{
  "phone": "0123456789",
  "otp": "123456",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "password": "newPassword123"
  }'
  response :
  {
  "success": true,
  "user": {
  "id": "019d432b-7188-746f-a1f0-e6d73c8a6e05",
  "createdByType": null,
  "updatedByType": null,
  "deletedByType": null,
  "createdById": null,
  "updatedById": null,
  "deletedById": null,
  "createdAt": "2026-03-31T09:13:33.831Z",
  "updatedAt": "2026-03-31T09:13:33.831Z",
  "deletedAt": null,
  "status": "Active",
  "email": null,
  "phone": "0123454444",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "type": "USER",
  "birthday": null,
  "url": null,
  "gender": null
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS1jdXN0b21lci0wMSJ9.eyJzdWIiOiIwMTlkNDMyYi03MTg4LTc0NmYtYTFmMC1lNmQ3M2M4YTZlMDUiLCJ0eXBlIjoiY3VzdG9tZXIiLCJlbWFpbCI6bnVsbCwiaWF0IjoxNzc0OTQ4NDEzLCJleHAiOjE3NzUwMzQ4MTN9.j4JEtTsr17XmrS9dh-3dy7bodhhkz0FdKLks2N1BCT9uSU63iMR3KlKc3N4iYwyv4Ug6UC80MhVaIOSpjHPHoxqns1EPbn64lmnZi3dmgxWTikkH6jeIsjcyNUnmCVkAM_5H4JxMe6uVEXm-22mXxnln9tP3mzAr8ZQLjr8iNfazaLN8XXmKIFzMwJHEemhSFbU5MIDt4PjWxAPId8Gb2n71U0xdBAg8wKpC1Hny8bIzn7vVo5pmd6SIMdnKYLLaCyobhH-WvqHgySjK3eenRaUJUULOPIMUZ_slKT5lGZU1hWhEdKHolkUJolbCAYjDQde1FkewPF4Zz3H7LhgytA",
  "refreshToken": "5ba6a94a90426a02fb9c6ec59dda7db9627d4ccfc3014eb938dc8ad442a12257966a7ddd8f16c33f84f128bce1e2ec387fa20574c1a7293371b8e3c026c1e44d"
  }

login :
curl -X 'POST' \
'https://dev.admin.trading.sevago.local/api/iam/customer/login' \
-H 'accept: _/_' \
-H 'Content-Type: application/json' \
-d '{
"phone": "0123456789",
"password": "newPassword123"
}'
res : {
"user": {
"id": "019d432b-7188-746f-a1f0-e6d73c8a6e05",
"createdByType": null,
"updatedByType": null,
"deletedByType": null,
"createdById": null,
"updatedById": null,
"deletedById": null,
"createdAt": "2026-03-31T09:13:33.831Z",
"updatedAt": "2026-03-31T09:13:33.831Z",
"deletedAt": null,
"status": "Active",
"email": null,
"phone": "0123454444",
"firstName": "Nguyen",
"lastName": "Van A",
"type": "USER",
"birthday": null,
"url": null,
"gender": null
},
"tokenId": "019d432b-9d67-7260-8904-ba1937bcccc2",
"accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS1jdXN0b21lci0wMSJ9.eyJzdWIiOiIwMTlkNDMyYi03MTg4LTc0NmYtYTFmMC1lNmQ3M2M4YTZlMDUiLCJ0eXBlIjoiY3VzdG9tZXIiLCJlbWFpbCI6bnVsbCwiaWF0IjoxNzc0OTQ4NDI1LCJleHAiOjE3NzUwMzQ4MjV9.kT8oXhYjiBcy6k5C3euokEnsu7ILMonby8dMiaG4k1SwpaClb0-zrdGV0LreIxj4igQ29BLpWVrl_N6lQU8j2hEpvSx9pwxpv0evCQc0EYVzAQJQYQF6LbIAFk5IKpTozpdQkaXAdzTcx4bXPuZE0-wo6bjAEHkf-1Z3JfW9ckz-mevFKIcUV7bACM0O-odomBhQvaWsEpucDJ9XMB4SA1Mhb2IDeYCcEsaDv0pXHOBYLSEEWbxqe_xMFKyJZOP_DA4KZATPY6t0DKzQkQ_agDy4IxKKeUKXXPYOmqs3u5tXNQwclNGbpRdGoJM9dvIqXrC97GISKRLd2So7hfp1tg",
"refreshToken": "b2a2440d08a2a32c4a111d69819ae48ad0cae31426858d19229a51b547ef014b0bf00eea0ce9dd3987996121a69fe11cb31a71191a5bbbe4ffca9e5be2411470"
}
logout :
curl -X 'POST' \
'https://dev.admin.trading.sevago.local/api/iam/customer/logout' \
-H 'accept: _/_' \
-d ''

logout all :
curl -X 'POST' \
'https://dev.admin.trading.sevago.local/api/iam/customer/logout-all' \
-H 'accept: _/_' \
-d ''

change password :
curl -X 'POST' \
'https://dev.admin.trading.sevago.local/api/iam/customer/change-password' \
-H 'accept: _/_' \
-H 'Content-Type: application/json' \
-d '{
"currentPassword": "string",
"newPassword": "string"
}'

forgotpassword:
curl -X 'POST' \
'https://dev.admin.trading.sevago.local/api/iam/customer/forgot-password' \
-H 'accept: _/_' \
-H 'Content-Type: application/json' \
-d '{
"phone": "0123456789"
}'
Response body
Download
{
"success": true,
"message": "Đã gửi mã OTP tới SĐT"
}
