# Hướng Dẫn Kiểm Thử (Testing Guide) Đầy Đủ 38 API Hệ Thống Cửa Hàng Sách

Tài liệu này đóng vai trò như một kịch bản kiểm thử (Test Case) chi tiết dành cho QA/QC hoặc Lập trình viên. Vui lòng sử dụng các phần mềm chuyên dụng như **Postman**, **Insomnia** hoặc **Thunder Client** (VSCode) để thực thi.

**Lưu ý chung chuẩn bị trước khi Test:**
- Chạy server local bằng môi trường terminal: `node src/index.js` (Server khởi chạy ở `http://localhost:3000`).
- Khi test các API Yêu cầu Cấp quyền (Có ghi chú **[KÈM TOKEN]**), bạn cần qua tab `Authorization`, chọn `Bearer Token` và dán cái Token dài ngoằng lấy được ở Bước 2 (Đăng nhập) vào đó!

---

## I. Nhóm 1: Xác thực (AUTH)

### 1. Đăng ký tài khoản (Register)
- **Method & Route:** `POST http://localhost:3000/api/auth/register`
- **Tab Body (raw -> JSON):**
  ```json
  { "email": "tester1@gmail.com", "password": "123", "confirmPassword": "123" }
  ```
- **Kịch bản Test (Pass):** Bấm mũi tên `Send`. Bạn sẽ thấy chuỗi `{ "message": "Đăng ký thành công..." }`. Sang Console màn hình dòng lệnh của Terminal Server, bạn LẤY CÁI MÃ OTP 6 SỐ VỪA IN RA.

### 2. Đăng nhập (Login)
- **Method & Route:** `POST http://localhost:3000/api/auth/login`
- **Tab Body (raw -> JSON):**
  ```json
  { "email": "tester1@gmail.com", "password": "123" }
  ```
- **Kịch bản Test (Pass):** Bấm `Send`. Trả về Mã 200 OK kẹp `{ "token": "eyJhb..." }`. COPY CÁI TOKEN NÀY LẠI ĐỂ XÀI CHO 30 MẤY CÁI BÊN DƯỚI NHÉ!

### 3. Quên mật khẩu (Forgot Password)
- **Method & Route:** `POST http://localhost:3000/api/auth/forgot-password`
- **Tab Body (raw -> JSON):**
  ```json
  { "email": "tester1@gmail.com" }
  ```
- **Kịch bản Test (Pass):** Bấm `Send`. Nhìn màn hình Terminal Console để lấy số OTP mới.

### 4. Xác nhận OTP (Verify OTP)
- **Method & Route:** `POST http://localhost:3000/api/auth/verify-otp`
- **Tab Body (raw -> JSON):** Điền OTP lấy ở bước ảo trên.
  ```json
  { "email": "tester1@gmail.com", "otpCode": "123456" }
  ```
- **Kịch bản Test (Pass):** Trả về `resetToken`. (Copy token này).

### 5. Đổi mật khẩu (Change Password)
- **Method & Route:** `POST http://localhost:3000/api/auth/change-password`
- **CÁCH TEST A (Người quên mã):** Ko điền Header. Body điền: `{"newPassword": "456", "confirmPassword": "456", "resetToken": "Mã ở bước 4"}`.
- **CÁCH TEST B (Người nhớ mã đổi app):** Vào tab Authorization gắn Token Đăng Nhập ở Bước 2. Body điền: `{"oldPassword": "123", "newPassword": "456", "confirmPassword": "456"}`.

---

## II. Nhóm 2: Sách & Tương Tác (BOOKS/REVIEWS)

### 6. Lấy toàn bộ Danh mục sách
- **Method & Route:** `GET http://localhost:3000/api/books/categories`
- **Kịch bản Test:** Cứ nã `Send`. Nếu hệ thống bắn ra JSON Cấu trúc mảng `[]` chứa các tên Category (Ví dụ: SGK, Thiếu nhi) là Pass! (Lấy 1 cái ID xài cho Bước 7).

### 7. Lấy Lưới Sách (+Lọc, +Phân trang)
- **Method & Route:** `GET http://localhost:3000/api/books?page=1&limit=5&categoryId=1` (Thay số 1 bằng Data bước 6 có).
- **Kịch bản Test:** Thử đổi `page=2`, check coi nó trả ra `{"data": [...], "pagination": ...}` đúng trang số 2 không.

### 8. Lấy Sách Gợi ý / Dành cho bạn
- **Method & Route:** `GET http://localhost:3000/api/books/for-you`
- **Kịch bản Test:** Chỉ trả thuần ra 1 mảng Mặc định 20 phần tử (hoặc ít hơn tùy DB đang có). Limit chuẩn mảng này là <= 20.

### 9. Chi tiết 1 cuốn sách (Get Book Details)
- **Method & Route:** `GET http://localhost:3000/api/books/2` (Giả sử 2 là ID sách).
- **Kịch bản Test Nâng Cao:** Nếu bấm gửi chay -> Vẫn ra Sách + Reviews bình thường. BẤM THỬ sang tab Authorization nhập Token Bước 2 -> Send -> Ra console Supabase mở bảng `ViewHistory` ra check xem DB có tự lén sinh ra 1 dòng ghi nhận người đó vừa xem sách ID 2 không. (Auto Tracking).

### 10. Chạy Tìm Kiếm (Search)
- **Method & Route:** `GET http://localhost:3000/api/books/search?q=Harry`
- **Kịch bản Test:** Chữ Harry phải viết hoa chữ h, thử viết thường `harry` xem `ilike` của cơ sở dữ liệu có thông minh không. Nếu có trả về là Pass.

### 11. Xem Tiểu sử Tác giả
- **Method & Route:** `GET http://localhost:3000/api/books/author/1`
- **Kịch bản Test:** Coi chừng nhập ID ko liên quan thì test phải văng ra JSON `[]` hoặc báo null là chuẩn.

### 12. List Sách theo 1 Tác giả 
- **Method & Route:** `GET http://localhost:3000/api/books/author/1/books`
- **Kịch bản Test:** Pass nếu ra `[]` với List sách 1 tác giả đó. 

### 13. List Sách của 1 Nhà Xb
- **Method & Route:** `GET http://localhost:3000/api/books/publisher/1/books`
- **Kịch bản Test:** Nhấn qua lại tự check logic tương tự API 12.

### 14. Đọc Comment Sách
- **Method & Route:** `GET http://localhost:3000/api/review/book/2` (Truyền ID cuốn sách vô cùng).
- **Kịch bản Test:** DB trống sẽ ra `[]`. Nếu ko trống ra list comment.

### 15. Push / Gửi bình luận [KÈM TOKEN TRONG HEADER]
- **Method & Route:** `POST http://localhost:3000/api/review`
- **Kịch bản Test:** Chuyển sang Header điền Bearer Token. Body raw JSON điền:
  ```json
  { "bookId": 2, "rating": 5, "comment": "Giao hàng bọc màn co kĩ cực kỳ!" }
  ```
  => Pass nếu ra status 201 Created. Quay lên gọi API số 14 xem dòng chữ có hiện lên ko.

### 16. Search Giọng nói / Ảnh (AI)
- **Method:** `POST /api/ai/speech-to-text` hoặc `POST /api/ai/image-to-text`...
- **Kịch bản Test:** Tab Body chọn `form-data`. Chọn Type của trường dữ liệu thành File thay vì Text. Upload file audio/Jpeg lên thử. Yêu cầu Internet có kết nối băng thông Google AI ổn định dể Pass.

---

## III. Nhóm 3: Giỏ Hàng (CART)

### 17. Chìa khóa vào Giỏ
- **Method & Route:** `GET http://localhost:3000/api/cart?customerId=1`
- **Kịch bản Test:** Điền đại số 1 vào `customerId`. Hệ thống rớt 1 cái Object `{"cartID": 15, "items": [], "totalAmount": 0}` là Pass, chứng tỏ Backe-end tự đi chợ phát luôn xe đẩy (giỏ hàng null) cho member mới! Lưu ID của customer lại.

### 18. Thảy Sách vào giỏ
- **Method & Route:** `POST http://localhost:3000/api/cart/add`
- **Tab JSON:** `{"customerId": 1, "bookId": 2, "quantity": 1}`
- **Kịch bản Test Gài bẫy:** Bấm nút Send 3 Lần liên tiếp!! Sau đó gọi lại API số 17, nếu API 17 móc ra biến `quantity` của món đồ tăng thành 3 là qua ải Pass Logic! (Cộng dồn tự động).

### 19. Sửa số lượng của Cục Món Đồ
- **Method & Route:** `PUT http://localhost:3000/api/cart/item/99` (Số 99 là `cartItemId` lấy từ hàm 17 trả về!).
- **Tab JSON:** `{"quantity": 10}`
- **Kịch bản Test Gài Bẫy (Tắt 1 phần API 20):** Sửa Body json gửi lên là `{"quantity": 0}`. Nếu Terminal Server bấm xóa dứt điểm Món đồ đó khỏi Giỏ Hàng luôn thì ĐẬU (Logic gom chung giảm xuống 0 là Hủy).

### 20. Trực tiếp Xóa bỏ Cục Món Đồ
- **Method & Route:** `DELETE http://localhost:3000/api/cart/item/99`
- **Kịch bản Test:** Khỏi gửi JSON, nhấp Send mất đồ là OK!

---

## IV. Nhóm 4: Cá Nhân Hóa (PROFILE)

*(Lưu ý: Mấy phần GET này toàn truyền vào URL `?customerId=X` để Test nhé)*

### 21. Vạch trần Profile
- **Method & Route:** `GET http://localhost:3000/api/profile?customerId=1`
- **Kịch bản:** Sẽ ra Object có `fullName`, `email`, `phoneNumber`. 

### 22. Đổi Tên, SĐT
- **Method & Route:** `PUT http://localhost:3000/api/profile`
- **Tab JSON:** `{"customerId": 1, "fullName": "Test Đẹp Trai", "phoneNumber": "0987654321"}`
- **Kịch bản:** Send xong quay lại số 21, data đổi thật thì Passed.

### 23. Móc Túi Lấy Tệp Dữ Liệu Địa Chỉ
- **Method & Route:** `GET http://localhost:3000/api/profile/address?customerId=1`
- **Kịch bản:** Sẽ rơi ra array của nhà số 1, số 2.

### 24. Setup Nhà (Địa Chỉ)
- **Method & Route:** `POST http://localhost:3000/api/profile/address`
- **Tab JSON:** `{"customerId": 1, "receiverName": "Anh B", "addressString": "7A Quận 1"}`. Tạo xong nhớ Lưu cái ID Địa chỉ (`addressID` trả về).

### 25. Thay Đổi Số Nhà
- **Method & Route:** `PUT http://localhost:3000/api/profile/address/1` (Số 1 là ID lấy ở 24).
- **Tab JSON:** `{"receiverName": "Anh C", "addressString": "Dời qua Quận 2"}`

### 26. Giải tỏa Mặt bằng (Xóa Địa Chỉ)
- **Method & Route:** `DELETE http://localhost:3000/api/profile/address/1`
- **Kịch bản:** Quá dễ, mất nhà là Pass!

### 27. Đếm Tiền (Tệp dữ liệu PT Thanh toán)
- **Method & Route:** `GET http://localhost:3000/api/profile/payment?customerId=1`

### 28. Điền Form Lập Thẻ / Ví Momo
- **Method & Route:** `POST http://localhost:3000/api/profile/payment`
- **Tab JSON:** `{"customerId": 1, "paymentMethod": "Ví MoMo"}`

### 29. Khóa Thẻ
- **Method & Route:** `PUT http://localhost:3000/api/profile/payment/1`
- **Tab JSON:** `{"paymentMethod": "Ví MoMo", "status": "Vô Hiệu"}`

### 30. Tiêu Hủy Thẻ
- **Method & Route:** `DELETE http://localhost:3000/api/profile/payment/1`

---

## V. Nhóm 5: Checkout Simulation (VOUCHER/SHIP)

### 31. Tìm Khuyến Mãi Ngon (Vận hành List Voucher)
- **Method & Route:** `GET http://localhost:3000/api/checkout-data/vouchers`
- **Kịch bản Test Phức Tạp:** Mở DataBase của hệ thống (Supabase) kiếm cái Voucher nào trong mảng. Chỉnh `usageLimit` bằng `0`. Nhấn lại API nếu cái dòng Voucher Vừa rồi "Tàng Hình" (Mất tích) tức là DB tự che giấu hàng Hết Lượt Chuẩn! Phải trả về mãng trống hoặc các mã khác.

### 32. Danh Bạ Sứ Giả (List Phương Thức Ship)
- **Method & Route:** `GET http://localhost:3000/api/checkout-data/shipments`
- **Kịch bản:** Lấy list nhà Giao.

### 33. Áp Má Toán Học Xác Nhận Giá Final (TÍNH NHÁP ÁP MÃ)
- **Method & Route:** `POST http://localhost:3000/api/checkout-data/vouchers/validate`
- **Tab JSON:** Gửi giả 1 món hàng tổng trị giá `10 000` VND. Kìm theo 1 cái mả trong DB mà MinOrderValue là `50 000`.
  ```json
  {"voucherCode": "CODETEST_DB", "totalAmount": 10000}
  ```
- **Kịch bản Test Fail Văng Lỗi:** Nút gửi phải phán ngay mã Status 400 `{"isValid": false, "message": "Đơn hàng chưa đạt giá trị..."}` thì API Code này mới an toàn không bị Hack! Chỉnh lên totalAmount: `100 000` lại xem có Pass và xả Trả số tiền sau khi trừ chưa `finalAmount`!

---

## VI. Nhóm 6: Định Đoạt Số Phận Giỏ Hàng (ĐƠN HÀNG/ORDER)

### 34. Hóa Kiếp Thành Đơn (Checkout)
- **Method & Route:** `POST http://localhost:3000/api/order/checkout`
- **Tab JSON NẶNG:** 
  ```json
  {
      "customerId": 1,
      "addressId": 1,
      "paymentId": 1,
      "shipmentId": 1,
      "voucherId": 1 
  }
  ```
- **Kịch bản Chốt Yếu Test Thử:** Đã Gửi Thành Công Nhận Sang Chữ OK chưa. Bước này Phải ra Status 200 Láy cái OrderID! GỬI TIẾP API 17 (Coi lại giỏ) => NẾU GIỎ HÀNG BỊ RESET NHẵn THÍNH LÀ 1 QUY TRÌNH HÀN THÀNH. Nếu trong API Gọi cái `UsageLimit` Voucher Trong DataBase cũng TRỪ 1 LÀ CHỨC NĂNG NGON.

### 35. Mua Nóng Tức Thì (Buy - Thẳng)
- **Method & Route:** `POST http://localhost:3000/api/order/buy-now`
- **Tab JSON NẶNG (Tương Tự + idbook + qty):** 
  ```json
  {
      "customerId": 1, "addressId": 1, "paymentId": 1, "shipmentId": 1,
      "voucherId": null,
      "bookId": 2, "quantity": 1
  }
  ```
- **Kịch bản Test:** Ra OrderID mới, Gọi Lại Giỏ (17) xem Giỏ Vẫn Còn Đồ Cũ Chứ k hề Mất thì là đúng (Không dính chạm tới giỏ)!

### 36. Kho Quản Đơn
- **Method & Route:** `GET http://localhost:3000/api/order?customerId=1`
- **Kịch bản Option:** Chèn Thêm `&status=Chờ%20Thanh%20Toán` vào sau ID để test Query Hàng theo Tag lọc! (Chỗ này cần Url Encode dấu Space nha, hoặc xài Param Form của postman cho khỏe).

### 37. Zoom In Hóa Đơn Trọn Bộ
- **Method & Route:** `GET http://localhost:3000/api/order/105` (Số Orderid Hú ở api số 35, 36)
- **Kịch bản:** Màn hình trả về cái JSON khổng lồ của Gói Đơn Hàng từ Table JOIN.

### 38. Từ Bỏ Thế Gian - Hủy Đơn Gấp! (Cancel)
- **Method & Route:** `PUT http://localhost:3000/api/order/105/cancel` (Phải ghi là PUT Route nhé, vì có param Update vào DB)
- **Kịch bản Hack Database Fail:** Nếu Bạn Dùng Status là Đã Giao ở trong Bảng Table Supabase mà bấm Gọi Cái Hủy Đơn Của Đơn Đó, Lập tức Code Chửi Ngay Chỗ `400` không cho hủy. Nếu Đang `Chờ TT` Nhấn 1 Phát Qua Hủy Chơi được! Đồng thời Voucher Hồi Lại `Limit + 1`. Pass Tốt Nghiệp Chức Năng!
