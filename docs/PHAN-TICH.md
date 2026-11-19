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
- 668 câu, 25 bộ (500 câu xếp chữ, 40 câu tính nhanh); 6 dạng: đoán đáp án, xếp chữ, emoji, đố vui, trắc nghiệm và tính toán.
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

## Cập nhật dòng Top 1 và đọc kết quả

Thêm marquee tên Top điểm số 1 kèm nhãn đỏ, vòng thời gian và dòng hướng dẫn mới. Màn kết quả có đếm ngược chuẩn bị câu tiếp. Thêm giọng tiếng Việt qua SpeechSynthesis, dự phòng msedge-tts với giới hạn thời gian, dung lượng và số tác vụ đồng thời. Bản xem trước luôn tắt giọng, không phát lặp theo snapshot hoặc kết nối lại.

Kiểm thử trình duyệt dùng giọng giả để xác nhận chính xác đáp án/tên, phát một lần, chuyển câu và preview im lặng. Phép thử trực tuyến trong môi trường phát triển đã gặp timeout; không coi là đã xác minh chất lượng âm thanh thực trên Windows/OBS. Khả năng phát thật cần giọng Việt của máy hoặc dịch vụ trực tuyến đáp ứng.

## Mở rộng ngân hàng câu hỏi

Giữ 93 câu đoán đáp án cũ, tăng xếp chữ từ 22 lên 500 bằng 478 gợi ý/đáp án bổ sung, giảm toán từ 240 xuống 40. Chọn câu toán từ nhiều mức và đủ ba phép cộng/nhân/chia. Tổng 668 câu, 25 nhóm chủ đề. Kiểm tra cấu trúc, ID duy nhất, 500 đáp án xếp chữ không trùng khi chuẩn hóa và bảo toàn chữ trong từng từ sau xáo trộn.

Bộ người dùng nhập được ưu tiên như trước; không ghi đè dữ liệu riêng khi nâng cấp. Có hướng dẫn nhập `data/questions.json` mới qua giao diện nếu đang dùng bộ cũ tùy chỉnh.
