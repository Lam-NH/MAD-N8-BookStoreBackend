# Báo cáo Tổng quan Tích hợp API Cửa hàng Sách

Tài liệu này tổng hợp toàn bộ danh sách các API đã được bổ sung thành công dựa trên ERD và yêu cầu nghiệp vụ của hệ thống Backend Cửa hàng Sách. Code đã được tích hợp hoàn chỉnh và đang hoạt động.

---

## Phần 1: Danh sách Trạng thái và Vị trí API (Định dạng Danh sách)

### 🔐 I. Nhóm Xác thực (AUTH)
**1. Nhận thông tin Đăng ký** `[Đã Xong]`
- `Vị trí`: authController.js (Dòng ~9)
- `Endpoint`: POST /api/auth/register

**2. Nhận thông tin Đăng nhập (Lấy Token)** `[Đã Xong]`
- `Vị trí`: authController.js (Dòng ~32)
- `Endpoint`: POST /api/auth/login

**3. Nhận Email Quên MK & Gửi OTP** `[Đã Xong]`
- `Vị trí`: authController.js (Dòng ~49)
- `Endpoint`: POST /api/auth/forgot-password

**4. Xác minh OTP lấy Token reset** `[Đã Xong]`
- `Vị trí`: authController.js (Dòng ~64)
- `Endpoint`: POST /api/auth/verify-otp

**5. Đổi mât khẩu / Cài MK mới** `[Đã Xong]`
- `Vị trí`: authController.js (Dòng ~86)
- `Endpoint`: POST /api/auth/change-password


### 📚 II. Nhóm Sách & Danh mục (BOOK)
**6. Trả về tất cả Danh mục** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~8)
- `Endpoint`: GET /api/books/categories

**7. Tất cả Sách (Phân trang & Lọc Category)** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~18)
- `Endpoint`: GET /api/books?page=1&categoryId=...

**8. Sách "Dành riêng cho bạn"** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~46)
- `Endpoint`: GET /api/books/for-you

**9. Chi tiết sách (+Tự động thêm Views Log)** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~57)
- `Endpoint`: GET /api/books/:id

**10. Tìm kiếm Text** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~95)
- `Endpoint`: GET /api/books/search?q=...

**11. Chi tiết Tác giả** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~114)
- `Endpoint`: GET /api/books/author/:id

**12. Danh sách sách theo Tác giả** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~124)
- `Endpoint`: GET /api/books/author/:id/books

**13. Sách theo nhà Xuất bản** `[Đã Xong]`
- `Vị trí Code`: bookController.js (Dòng ~137)
- `Endpoint`: GET /api/books/publisher/:id/books

**14. Lấy Comment của SGK** `[Đã Xong]`
- `Vị trí Code`: reviewController.js (Dòng ~7)
- `Endpoint`: GET /api/review/book/:bookId

**15. Gửi đánh giá sách (Kèm Token Header)** `[Đã Xong]`
- `Vị trí Code`: reviewController.js (Dòng ~21)
- `Endpoint`: POST /api/review

**16. Tìm bằng Giọng/Ảnh/Chatbot** `[Đã Có Sẵn]`
- `Vị trí Code`: aiController.js
- `Endpoint`: Các hàm POST trong /api/ai/...


### 🛒 III. Nhóm Giỏ hàng (CART)
**17. Xem tất cả giỏ hàng (Kèm tính tổng)** `[Đã Xong]`
- `Vị trí Code`: cartController.js (Dòng ~4)
- `Endpoint`: GET /api/cart?customerId=1

**18. Thêm sách vào giỏ (Tự cộng dồn số lượng)** `[Đã Xong]`
- `Vị trí Code`: cartController.js (Dòng ~28)
- `Endpoint`: POST /api/cart/add

**19. Tăng/Giảm lượng SP (≤0 là Xóa)** `[Đã Xong]`
- `Vị trí Code`: cartController.js (Dòng ~49)
- `Endpoint`: PUT /api/cart/item/:cartItemId

**20. Xóa hoàn toàn 1 ô SP trong giỏ** `[Đã Xong]`
- `Vị trí Code`: cartController.js (Dòng ~65)
- `Endpoint`: DELETE /api/cart/item/:cartItemId


### 👤 IV. Hồ sơ & Ví (PROFILE)
**21. Lịch sử / Thông tin cá nhân** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~5)
- `Endpoint`: GET /api/profile?customerId=...

**22. Cập nhật (Tên, SĐT)** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~17)
- `Endpoint`: PUT /api/profile

**23. Lấy tất cả Thông tin Địa chỉ của KH** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~28)
- `Endpoint`: GET /api/profile/address?customerId=...

**24. Thêm mới Địa chỉ** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~39)
- `Endpoint`: POST /api/profile/address

**25. Sửa thông tin Địa chỉ** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~50)
- `Endpoint`: PUT /api/profile/address/:id

**26. Xóa Địa chỉ** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~63)
- `Endpoint`: DELETE /api/profile/address/:id

**27. Trả về Phương thức Thanh toán (Ví, Thẻ)** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~74)
- `Endpoint`: GET /api/profile/payment?customerId=...

**28. Thêm PT Thanh toán mới** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~85)
- `Endpoint`: POST /api/profile/payment

**29. Đổi tên/trạng thái PT Thanh toán** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~96)
- `Endpoint`: PUT /api/profile/payment/:id

**30. Xóa PT Thanh toán** `[Đã Xong]`
- `Vị trí Code`: profileController.js (Dòng ~109)
- `Endpoint`: DELETE /api/profile/payment/:id


### 🎟 V. Dữ liệu Thanh Toán Checkout (DATA)
**31. List Voucher khả dụng (Còn hạn, Lượt)** `[Đã Xong]`
- `Vị trí Code`: checkoutDataController.js (Dòng 5)
- `Endpoint`: GET /api/checkout-data/vouchers

**32. List Vận chuyển (Giao nhanh, chậm...)** `[Đã Xong]`
- `Vị trí Code`: checkoutDataController.js (Dòng 19)
- `Endpoint`: GET /api/checkout-data/shipments

**33. Tính ảo Voucher (Lọc Logic Giá Trị)** `[Đã Xong]`
- `Vị trí Code`: checkoutDataController.js (Dòng 29)
- `Endpoint`: POST /api/checkout-data/vouchers/validate


### 📦 VI. Đơn hàng (ORDER)
**34. Tạo đơn từ Giỏ hàng (Tự dọn giỏ)** `[Đã Xong]`
- `Vị trí Code`: orderController.js (Dòng ~5)
- `Endpoint`: POST /api/order/checkout

**35. Mua Ngay 1 SP (Không động giỏ)** `[Đã Xong]`
- `Vị trí Code`: orderController.js (Dòng ~51)
- `Endpoint`: POST /api/order/buy-now

**36. Xem lịch sử Đơn (Bộ lọc Trạng Thái)** `[Đã Xong]`
- `Vị trí Code`: orderController.js (Dòng ~100)
- `Endpoint`: GET /api/order?customerId=1&status=...

**37. Xem 1 Đơn (Chi tiết Bill chuẩn)** `[Đã Xong]`
- `Vị trí Code`: orderController.js (Dòng ~116)
- `Endpoint`: GET /api/order/:orderId

**38. Hủy Đơn (Chỉ Đang giao, Trả thẻ Voucher)** `[Đã Xong]`
- `Vị trí Code`: orderController.js (Dòng ~136)
- `Endpoint`: PUT /api/order/:orderId/cancel

---

## Phần 2: Hướng Dẫn Sử Dụng Chi Tiết (Toàn Bộ 38 API)

Dưới đây là đặc tả Input (Cách gửi) và Output (Mô tả nhận) của 38 API trong hệ thống. Note: Bất cứ khi nào Frontend có lỗi 401 thì hãy thêm `Authorization: Bearer <Token_Lấy_Được_Ở_Login>` vào Request Headers.

### I. Xác thực (AUTH)
**1. Đăng ký tài khoản mới**
- API: `POST /api/auth/register`
- Nhận JSON: `{"email": "test@gmail.com", "password": "123", "confirmPassword": "123"}`
- Trả về 201 Created: Đã lưu người dùng (chờ xác thực email - hệ thống log ra màn hình console).

**2. Đăng Nhập**
- API: `POST /api/auth/login`
- Nhận JSON: `{"email": "...", "password": "..."}`
- Trả về: Chứa `token` (String, lưu nó lại) và `user` (Object thông tin).

**3. Gửi OTP Quên Mật Khẩu**
- API: `POST /api/auth/forgot-password`
- Nhận JSON: `{"email": "test@gmail.com"}`
- Trả về 200: Gửi thành công OTP qua hệ thống.

**4. Khớp mã OTP lấy mã Đổi vé**
- API: `POST /api/auth/verify-otp`
- Nhận JSON: `{"email": "...", "otpCode": "123456"}`
- Trả về: Chứa biến `resetToken` - là một thẻ quyền lực tồn tại 15 phút chuyên dùng để kích hoạt hàm thứ 5.

**5. Cập nhật / Đổi Mật Khẩu**
- API: `POST /api/auth/change-password`
- Nếu dùng đổi pass nội bộ: Header kẹp Bearer Token thông thường. Gửi `{"oldPassword": "..", "newPassword": "..", "confirmPassword": ".."}`
- Nếu dùng kiểu reset (Quên MK): Bỏ header, kẹp thẳng token từ bước 4 vào body - Gửi `{"newPassword": "..", "confirmPassword": "..", "resetToken": "Mã từ hàm 4"}`.

### II. Quản lí Sách và Tương tác (BOOK & REVIEW)
**6. Lấy tất cả Danh mục**
- API: `GET /api/books/categories`
- Trả về Array Object Category.

**7. Lấy danh sách Sách (Có lọc/Phân trang)**
- API: `GET /api/books?page=1&limit=20&categoryId=15` (Các params đều tuỳ chọn)
- Trả về: `{"data": [{sách...}], "pagination": {..}}`

**8. Lấy Sách Gợi ý mới nhất**
- API: `GET /api/books/for-you`
- Trả về danh sách ngẫu nhiên hoặc 20 sách mới nhất bổ sung từ bảng Sách.

**9. Xem chi tiết Sách**
- API: `GET /api/books/:id` (Ví dụ `/api/books/12`)
- *Đặc biệt*: Header NÊN truyền `Authorization` có token (chỉ đọc) để Server gắn thêm dòng Lịch sử (bảng ViewHistory) cho Client này.
- Trả về: `{"book": {}, "avgRating": 4.5, "top3Reviews": [], "similarBooks": []}`

**10. Tìm sách qua chuỗi kí tự (Text)**
- API: `GET /api/books/search?q=Harry&page=1`
- Trả về JSON giống hệ api 7 nhưng chỉ ra kết quả có khớp chuỗi Tên (Title).

**11-13. API lấy Sách của Tác Giả & Nhà XB**
- `GET /api/books/author/:id` (Lấy tên/tiểu sử vắn tắt của Tác giả).
- `GET /api/books/author/:id/books`: Trả về array JSON các sách của tác giả đó.
- `GET /api/books/publisher/:id/books`: Trả array JSON danh mục sách nxb đó.

**14. Xem danh sách Đánh Giá**
- API: `GET /api/review/book/:bookId` (vd: `.../book/55`)
- Trả về Array mọi review, ai viết, viết gì, mấy sao.

**15. Thêm bình luận (Đánh giá)**
- API: `POST /api/review`
- *Khóa*: Bắt buộc có Header Authorization Bearer.
- Mảng Body: `{"bookId": 55, "rating": 5, "comment": "Tuyệt vời"}`

**16. Giọng nói / Hình ảnh**
- Dùng `multipart/form-data` để đính kèm file âm thanh hoặc file ảnh ném vào `POST /api/ai/speech-to-text`... để nhờ Google phân giải văn bản.

### III. Quản lý Giỏ Hàng (CART)
**17. Xem Giỏ của Mình**
- API: `GET /api/cart?customerId=1`
- Trả về Object: `{"cartID": 102, "items": [...], "totalAmount": 550000}`. Tất cả items có kèm theo thuộc tính giá, tên sách, URL ảnh sách.

**18. Bỏ sách vô Giỏ**
- API: `POST /api/cart/add`
- Mẫu: `{"customerId": 1, "bookId": 12, "quantity": 1}`. 
- Tính năng: Nếu id Sách 12 đã tồn tại trong giỏ thì hệ thống tự +1 lên giỏ hàng.

**19. Đẩy cấu trúc Số Lượng của Ô Item lên/xuống**
- API: `PUT /api/cart/item/:cartItemId` (Đây là ID của Dòng Giỏ Hàng `CartItem`, không phải id cuốn sách).
- Mẫu: `{"quantity": 5}`. Nếu bạn phái `quantity: 0`, Backend tự động xóa mòn hàng khỏi DB.

**20. Xóa dứt điểm Ô (Remove Item)**
- API: `DELETE /api/cart/item/:cartItemId`
- Khỏi truyền Body, tự bốc hơi khởi Giỏ hàng.

### IV. Hồ sơ, Địa chỉ, Thanh toán (PROFILE)
*(Mọi api phần này đều yêu cầu truyền `customerId` qua Query đối với GET, hoặc JSON body với POST/PUT)*

**21-22. Truy xuất Thông tin user / Sửa tài khoản**
- `GET /api/profile?customerId=1` đê xem.
- `PUT /api/profile` kèm `{"customerId": 1, "fullName": "Son Goku", "phoneNumber": "0912..."}` để cập nhật.

**23-26. Sổ tay Địa chỉ (Address)**
- `GET /api/profile/address?customerId=1` (Lấy mảng địa chỉ).
- `POST /api/profile/address` body: `{"customerId": 1, "receiverName": "Nguyen A", "addressString": "72A..."}` (Tạo mới).
- `PUT /api/profile/address/:addressId` body sửa Address (Sửa).
- `DELETE /api/profile/address/:addressId` (Xóa).

**27-30. Tủ thẻ Thanh toán (Payment Method)**
- Các hàm hoạt động y hệt Address ở trên. Tự thay chữ `address` thành chữ `payment` trên route. 
- Tạo Thẻ cần Body: `{"customerId": 1, "paymentMethod": "Visa - 1234"}`

### V. Các Chỉ Báo Checkout (DATA)
*(Lấy dữ liệu động dành cho list thả xuống của UI màn hình Checkout)*

**31. Thẻ Voucher**
- API: `GET /api/checkout-data/vouchers`
- Chức năng: Chỉ trả ra danh sách các thẻ có số lượt `usageLimit > 0` và date chưa Expired. (Cái nào lố hạn tự ẩn).

**32. Đơn vị Vận Chuyển**
- API: `GET /api/checkout-data/shipments`
- Trả ra list nhà xe. Mẫu: `[{"shipmentMethod": "Giao Chuẩn"}]`

**33. Bot Check tính tiền Voucher (Xác suất)**
- API: `POST /api/checkout-data/vouchers/validate`
- Dữ liệu gửi: `{"voucherCode": "FREESHIP1", "totalAmount": 150000}`.
- Chức năng: Hệ thống giả tính xem mua 150K thì áp mã đó hợp lệ ko. 
- Nếu lố MinOrder: Trả 400 và {"isValid": false}. Nếu ngon lành: Trả true + Gói tiền FinalAmount đã giảm chính xác dựa theo toán học Percent % (Ví dụ giảm 10%) hoặc Fixed (Giảm cứng 20k).

### VI. Xử lí Đơn (ORDER)
**34. Đặt tất cả hàng trong Giỏ**
- API: `POST /api/order/checkout`
- Dữ liệu: `{"customerId": 1, "addressId": 5, "paymentId": 2, "shipmentId": 1, "voucherId": 3}` (Nếu không có voucher truyền `null`).
- Hệ quả: Giỏ hàng bị delete trắng. Order được tạo. Lấy lượt voucher trừ hao đi 1. Trả về OrderID vừa chốt.

**35. Nút Mua Ngay**
- API: `POST /api/order/buy-now`
- Dữ liệu: Gửi y chang hàm đặt Giỏ hàng Ở TRÊN, nhưng bổ sung thêm `"bookId": 12, "quantity": 1`. Lập tức tạo thêm Order mới mặc kệ Giỏ Hàng cũ.

**36. Kiểm tra lại Bảng Đơn của Khách Hàng (Tất cả)**
- API: `GET /api/order?customerId=1` (Lấy hết). 
- Nếu muốn xem riêng trạng thái, đưa vô query: `GET /api/order?customerId=1&status=Đang giao`.
- Kết cấu Object lớn, đính kèm cả ảnh, sách...

**37. Re-Check 1 Hóa Đơn Trọn vẹn**
- API: `GET /api/order/:orderId`
- Thích hợp khi User bấm "Xem chi tiết Hóa Đơn". Kéo cả địa chỉ nhà, Vận chuyển lên cho User coi lại.

**38. Rút lui Hủy Đơn**
- API: `PUT /api/order/:orderId/cancel`
- Status hiện tại chỉ có tác dụng nếu đơn đang có dãn nhãn `Chờ thanh toán` hoặc `Đang xử lý`. Order sẽ lật trạng thái thành `"Đã Hủy"`.
- Đặc thù (Cây Voucher): Trả Voucher đó về cho Hệ thống (Cộng usageLimit + 1 lại xài tiếp đợt sau nếu có duyên).

---

## Phần 3: Hướng Dẫn Tích Hợp API Dành Cho AI Tạo Code (AI Coding Agent)

**[SYSTEM PROMPT / LƯU Ý DÀNH CHO AI ĐỌC TÀI LIỆU NÀY]**
Nếu bạn là một mô hình AI Agent hay AI Code Generator đang nhận nhiệm vụ viết mã cho ứng dụng Client (Client App) dựa vào dàn backend này. Dù bạn dùng `Kotlin/Jetpack Compose` (Android) hay `React/Vue.js` (Web Web App), bạn **PHẢI** tuân thủ cực kỳ nghiêm ngặt các nguyên tắc luồng dữ liệu dưới đây để tích hợp trơn tru 38 API này:

### 1. Kiến trúc Mạng & Ủy quyền Bảo mật (Networking & Auth Hooks)
- **Base URL:** Thiết lập hằng số `BASE_URL` trỏ về API server (VD: `http://localhost:3000/api`).
- **Thư viện đề xuất:** Sử dụng `Retrofit + OkHttp` (Android) hoặc `Axios` (Web).
- **JWT Interceptor:** Sau khi gọi thành công `POST /api/auth/login`, bạn sẽ nhận được một `token`. Hãy lưu Token này vào `EncryptedSharedPreferences` (Android) hoặc `localStorage / Cookies` (Web). Bắt buộc phải viết một cái Interceptor (Màng lọc tín hiệu) để tự động nhét chuỗi `Authorization: Bearer <token>` vào Header của TẤT CẢ request sau đó.
- **Bẫy lỗi 401 Toàn cục:** Quản lý mã lỗi HTTP trả về, nếu lỗi nhận được là `401 Unauthorized` ở bất cứ màn hình nào, AI hãy tự động xóa Token dưới máy và đẩy (Navigate/Redirect) ứng dụng về Màn hình Đăng Nhập.

### 2. Sơ đồ Mapping Màn Hình (Screen Architecture x API)

**A. Chuỗi Màn Hình Hành Lang (Authentication Flow)**
- Quản lý State bằng ViewModel (Android) hoặc Redux/Zustand (Web).
- **Trang Đăng Nhập:** Gọi API `2`. Nếu OK, set Login state `Customer = user` và giấu màn hình này đi.
- **Trang Đăng Ký:** Gọi API `1`. Đừng chuyển qua Login vội, hãy hiện Popup "Đã gửi Email OTP thành công!".
- **Quên Mật Khẩu (3 Trạm):** 
  - Màn 3A (Nhập Email): Gọi API `3`. Pass thì chuyển qua 3B.
  - Màn 3B (Nhập OTP 6 số): Gọi API `4`. Backend sẽ rớt lại cho 1 cái `resetToken` tạm thời (chỉ xài đc 15 phút).
  - Màn 3C (Gõ MK Mới): Gọi API `5` (Change Password) và phải chắc chắn đính kèm cái `resetToken` kia vô Body.

**B. Không gian Trang chủ (Home Screen)**
- AI cần Dispatch 2 hàm Fetch Gọi API song song (Concurrent / Async-Await `Promise.all`):
  - Khung Thanh trượt dọc ngang (Tabs/Pill): Gọi API `6` (`/books/categories`).
  - Lưới hiển thị Gợi ý (Grid 2 cột): Gọi API `8` (`/books/for-you`).
- Phản ứng Tabs: Mỗi khi User click vào Tab có Category số X, AI hãy Trigger gọi Data cho lưới Sách bằng API `7` (Nhét `categoryId=X` và `page=1` vào QueryURL).

**C. Màn hình Chi tiết Sách (Book Detail Screen)**
- Khi User đụng vào một bìa sách, truyền `bookId` sang Router mới và gọi API `9` (`GET /books/:id`). Chỗ này AI hãy trích xuất 4 thứ từ JSON bóc được: `book` info (để vẽ giá tiền bìa sách), `avgRating` (vẽ thanh 5 ngôi sao trên UI), `top3Reviews` (vẽ nhanh 3 dòng comment bọt biển) và `similarBooks` (đổ vào một thẻ Carousel nằm ngang dưới đáy màn hình).
- *Lưu ý siêu bự:* Dùng Interceptor kẹp Token vào API `9` này thì Backend mới ghi nhận được Lịch sử Xem của người xài đó nhé.
- Nút "Thêm vào giỏ hàng" (Add to Cart Floating Button): Mặc định gửi API `18` với số lượng Quantity đúc cứng = 1.
- Nút "Xem toàn bộ Đánh giá": Mở ra BottomSheet, lúc này AI mới gọi tiếp API `14`.

**D. Cỗ máy Tìm Kiếm (Search UI)**
- Cần nhúng thư viện *Luồng chậm (Debounce)* cho TextBox tìm kiếm (Chậm lại ~400ms sau khi User dừng gõ) rồi mới Fire lệnh API `10` (`GET /books/search?q=gỗ`).
- Gắn một nút Hình Cái Micro vào Góc TextBox, nhấn vào là khởi động Android SpeechRecognizer gởi Audio lên API `16` nhen.

**E. Khu vực Giỏ Hàng (Cart Management)**
- Lúc OnInit màn hình, đổ dữ liệu bằng API `17`.
- **Tuyệt chiêu UX:** Tương tác với Nút Tăng/Giảm (Cộng/Trừ) sách trong giỏ. ĐỪNG gọi API Server ngay lập tức sẽ sập mạng. AI hãy cấu hình Front-end tự Nhảy Số, sau đó dùng *Debounce* dồn 1 giây để gửi dứt điểm chốt bằng API `19` (`PUT /cart/item/:id`). Nếu số tụt xuống 0, Backend tự xóa, Client hãy gọi `.filter` ném ô giao diện đó đi luôn.
- Tính năng vuốt màn hình để vứt hàng (Swipe to Delete): Map ngay với API `20`.

**F. Thử thách Tối Thượng: Màn hình Thanh Toán (Checkout Form)**
Cỗ máy tạo Code AI bắt buộc phải gom cả thảy 4 dữ kiện từ Backend để rải lên Form và tính ra con số chót:
1. Đọc danh bạ Địa chỉ giao hàng: API `23`.
2. Đọc thẻ quẹt tiền: API `27` -> Lên cái Dropdown.
3. Đọc đường bay (Giao xe / máy bay): API `32`.
4. Làm cái View "Chọn Voucher". Gọi kho API `31`. Lúc khách check vào Voucher, gọi tiếp API `33` của Backend đẩy `Giỏ hàng Total + ID Voucher` lên để Backend trả về cái giá trị bị trừ và tính ra FinalAmount cho yên tâm (Không tự code Front-end trừ tiền tránh gian lận).
5. Nút Khổng lồ Xong Luôn "Xác Nhận Thanh Toán": Gom hết `addressId`, `paymentId`, `shipmentId`, `voucherId` gởi POST API `34`.
6. Còn nếu nút này được gọi là "Mua Ngay" từ trong View Sách (API 35), nhớ kẹp thêm biến `bookId` và `quantity`.

**G. Ngăn tủ Account & Lịch sử Orders (Profile Dashboard)**
- Trang Lịch sử: Làm TabLayout đắp 3 Trạng thái. AI dùng biến `status` quăng lên query của API `36`. Cho hiện màu đỏ nếu Text status là "Đã Hủy", Xanh nếu "Hoàn tất". Lấy mảng items.BookImages ra móc hình ảnh sách đại diện thu nhỏ đi kem.
- Nếu người ta bấm Hủy Đơn, gọi API `38`.
- Làm các luồng Form nhập liệu đơn giản CRUD xài hết API từ 23 -> 30 để cho phép dân tình đổi info nhé A.I!

**[HƯỚNG DẪN KẾT THÚC DÀNH CHO AI]**
- Bất cứ khi nào Front-end bắt được mã `error` 400 hoặc 500, cấm Console.log im lặng. Hãy Pop-up (Alert / Toast Dialog) trích cái thông điệp `error.message` của tao trả xuống cho người xài ứng dụng đọc mượt mà nhé!
