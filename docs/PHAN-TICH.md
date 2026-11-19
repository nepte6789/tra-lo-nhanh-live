# Phân tích video mẫu và triển khai

## Quan sát trong video 107 giây

- Màn hình dọc TikTok, nền tím đậm, điểm nhấn vàng, khung câu hỏi phía trên.
- Số câu tăng từ khoảng 242 tới 248. Nội dung ví dụ: Hồ Gươm, Mặt Trời, con rùa, quả vải, nón lá, cà phê, cái ghế.
- Gợi ý đồ vật, sau đó ô chữ xanh. Khi có người đúng, thay khung bằng avatar, tên, đáp án, +1 điểm, tổng điểm và hạng.
- Tự chuyển sang câu khác sau khoảng nghỉ ngắn, có hiệu ứng mảnh màu rơi.
- Bảng điểm và bảng quà riêng biệt. Theo điều chỉnh của người dùng, bản này **đổi Top quà sang trái, Top điểm sang phải**.
- Bình luận, tim và phần tên kênh ở ngoài vùng game là giao diện TikTok; không giả lập những phần đó trong overlay.
- Từ video không xác định được công nghệ, dịch vụ kết nối hoặc mọi tùy chọn phần mềm gốc. Đây là bản triển khai mới theo cơ chế quan sát được, không sao chép mã nguồn phần mềm gốc.

## Những gì được bổ sung

- Hai luật tính điểm: người đầu tiên hoặc tất cả người đúng; khóa mode/điểm theo từng câu để sửa thiết lập không làm thay đổi luật giữa chừng.
- 390 câu, 10 bộ; 6 dạng: đoán đáp án, xếp chữ, emoji, đố vui, trắc nghiệm và tính toán.
- Lọc bộ/loại, nhập/xuất JSON, thêm alias và giải thích.
- Bộ xử lý trạng thái `idle → question → reveal → question`, kiểm tra hạn chót cả trong vòng tick và lúc nhận bình luận.
- Bỏ trùng sự kiện, chống một người nhận nhiều điểm cùng câu, dùng thời điểm đến máy chủ để quyết định thắng.
- Điều khiển tạm dừng, dừng, bỏ câu, hiện đáp án; màn xem trước riêng tắt âm để không vang đôi.
- Lưu điểm và cấu hình; thông tin quà không ảnh hưởng điểm đoán.

## Thiết kế chịu nhiều lượt trả lời

1. Không tạo kết nối hay tải HTML mới khi có đáp án/câu mới.
2. Nhận bình luận và xử lý bằng Map/Set ngay trong bộ nhớ, không gọi mạng hay đọc file trên đường xử lý đáp án.
3. WebSocket chỉ gửi snapshot gọn, gom cập nhật thường lệ 100 ms; riêng người thắng LIVE thật được đẩy ngay trong lần xử lý sự kiện. Bảng xếp hạng giới hạn 10 dòng, người thắng hiển thị tối đa 20 người; tổng đúng vẫn tính đầy đủ.
4. Không tải thư viện frontend, font hay ảnh từ CDN lúc khởi động. Avatar người dùng là tùy chọn và có ký tự thay thế khi tải lỗi.
5. Ghi dữ liệu theo đợt 3 giây, dùng file tạm rồi rename. Các điểm thử loại khỏi dữ liệu lưu.
6. Giới hạn cache và hàng đợi gửi để tránh tích lũy vô hạn. Khán giả không thể gửi lệnh điều khiển qua WebSocket overlay.
7. Chỉ trình duyệt quản trị được nhập bộ câu hỏi và thao tác dữ liệu; nếu mở LAN phải có token và danh sách host.

## Kiểm thử

`npm test` kiểm tra chuẩn hóa tiếng Việt, tính điểm đầu tiên/tất cả, sự kiện trùng, quá hạn, tạm dừng, tự chuyển, đáp án trắc nghiệm, không lộ đáp án trước reveal, shuffle, import lỗi, bảng quà độc lập và burst nhiều người đúng. Bài tích hợp mở máy chủ thật, thử HTTP/WebSocket và chặn origin lạ/quyền quản trị.

`npm run load-test` dùng 100.000 tài khoản giả, xác minh đủ lượt đúng, payload giới hạn. Kết quả tham khảo trên môi trường phát triển: khoảng 1,1 giây xử lý và khoảng 20 ms tạo snapshot (thay đổi theo máy). Không thể dùng phép thử này để suy ra bảo đảm tốc độ TikTok thực.

Kiểm tra trình duyệt riêng: bắt đầu câu, hiện kết quả, điểm bên phải, quà bên trái, tạm dừng/tiếp tục và màn điều khiển trên điện thoại, không lỗi JavaScript.

## Chưa xác minh

- Kết nối LIVE TikTok thực, các biến thể sự kiện quà của mọi loại quà, thời gian trễ đến máy chủ.
- Phát âm/thêm nguồn trong LIVE Studio và OBS trên máy Windows của người dùng.
- Độ tải trên cấu hình máy người dùng và kết nối mạng của họ.

## Cải tiến theo phản hồi về người thắng

Kiểm tra mã cũ phát hiện cửa sổ chặn bình luận 100 ms có thể bỏ đáp án đúng khi cùng người chơi vừa sửa đáp án sai. Đã bỏ cửa sổ chặn đó. Set người đã đúng và mã tin nhắn vẫn chặn cộng trùng. LIVE thật cưỡng chế first-only; người thứ 2, 3, 4 không đổi người thắng hoặc ticker sau khi câu bị khóa.

Thêm kiểm tra sửa đáp án ngay, sự kiện cũ sang câu mới (timestamp millisecond/second), dọn người thử khi kết nối, khóa chế độ và callback thông báo đồng bộ khi đúng. Sự kiện TikTok không có timestamp hoặc timestamp chỉ đến giây không đủ để chứng minh thứ tự gửi tuyệt đối; chương trình dùng thứ tự nhận tại máy chủ và không cố chờ để xếp lại.

Font Be Vietnam Pro đặt cục bộ (600 và 800) với giấy phép OFL. Không dùng font mạng cho overlay; tên người thắng xuất hiện trước khi avatar tải xong.
