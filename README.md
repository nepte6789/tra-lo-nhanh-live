# Trả lời nhanh · TikTok LIVE

Game câu hỏi tương tác qua bình luận, chạy trên máy tính. Giao diện dọc tím/vàng, người trả lời đúng được cộng điểm và hiện tên. **Top quà bên trái, Top điểm bên phải.**

## Xem giao diện

[Ảnh màn hình LIVE](docs/screenshots/overlay.png) · [Ảnh bảng điều khiển](docs/screenshots/studio.png)

## Ô chữ xáo trộn theo từng từ

Các câu đoán đáp án, xếp chữ, đố vui và emoji hiển thị đúng thứ tự:

1. **Câu hỏi / gợi ý.**
2. **Hàng ô đáp án trống hoàn toàn**, không chữ, không dấu hỏi, chia nhóm theo số chữ của mỗi từ: HỒ GƯƠM → 2 ô trống, khoảng cách, 4 ô trống.
3. Nhãn **CHỮ CÁI BỊ XÁO TRỘN**.
4. **Hàng ô nhỏ riêng bên dưới**, chứa toàn bộ chữ cái đảo vị trí, giữ dấu tiếng Việt.

Hai hàng tách biệt: không đặt chữ vào ô đáp án trước khi chốt câu. Chữ xáo trộn giữ nguyên trong suốt câu, không đổi mỗi lần nhận bình luận. Câu tính toán và trắc nghiệm không hiện hai hàng này.

[Xem mẫu HỒ GƯƠM](docs/screenshots/word-tiles.png)

## Bản cập nhật overlay và người thắng

- Font **Be Vietnam Pro** có dấu tiếng Việt, đặt sẵn trong repo, không gọi Google Fonts khi đang LIVE. Font theo SIL Open Font License tại `public/fonts/OFL.txt`.
- Khung hỏi và người thắng rõ hơn, chữ lớn, tăng độ tương phản. Top quà trái, Top điểm phải.
- LIVE thật tự khóa **người đúng đầu tiên**, dừng câu đang thử và loại người thử khỏi bảng. Kết nối xong bấm **Bắt đầu** để vào câu mới. Chế độ nhiều người đúng chỉ dùng ngoại tuyến.
- Kết quả thắng từ bình luận thật được gửi ngay tới màn hình, không chờ đợt gom cập nhật 100 ms. Không chờ tải avatar/âm thanh mới hiện tên.
- Cho phép sửa từ sai sang đúng ngay, không chặn bình luận đúng bằng khoảng nghỉ 100 ms.
- Dùng thời gian sự kiện (khi TikTok cung cấp) để bỏ bình luận từ câu cũ; với dấu thời gian chỉ chính xác tới giây, không phân biệt được hai sự kiện trong cùng giây. Không đoán lại thứ tự từ dấu thời gian thô.
- **Nhanh nhất = đáp án đúng hợp lệ đến máy chủ đầu tiên.** Không bảo đảm trùng thứ tự bình luận trên mọi điện thoại hay loại bỏ độ trễ mạng TikTok.

## Cài trên Windows

1. Cài **Node.js 20 trở lên** tại https://nodejs.org/ (bản LTS).
2. Tải repo: nút **Code → Download ZIP**, giải nén toàn bộ vào thư mục, ví dụ `D:\tra-loi-nhanh-live`.
3. Nháy đúp **start.bat**. Lần đầu cần mạng để cài thư viện.
4. Bảng điều khiển: **http://127.0.0.1:3010**.
5. Chọn bộ câu hỏi → **Lưu thiết lập → Bắt đầu**.
6. Chưa LIVE: bấm **Thử đáp án đúng** hoặc nhập bình luận thử để kiểm tra.

Nếu dùng dòng lệnh, chạy trong thư mục dự án:

```sh
npm ci
npm test
npm start
```

Ứng dụng Node cũng chạy trên Linux/macOS; `start.bat` dành cho Windows. Mở lại terminal sau khi mới cài Node.

## Đưa vào TikTok LIVE Studio / OBS

- Thêm nguồn **Liên kết / Browser**: `http://127.0.0.1:3010/overlay.html`.
- Kích thước **1080 × 1920**, đặt vừa khung dọc.
- OBS: bật tùy chọn điều khiển âm thanh nguồn trình duyệt nếu muốn trộn âm ở OBS.
- Trên trình duyệt thường, nhấn **Bật âm báo** một lần. Bản xem trước ở bảng điều khiển tự tắt tiếng để tránh tiếng đôi.
- Bạn tự bắt đầu LIVE trên TikTok, sau đó nhập `@tênkênh` ở bảng điều khiển → **Kết nối**.
- Không cần mật khẩu, cookie hay mã đăng nhập TikTok. Không tự động bấm phát LIVE.
- Nếu kết nối lỗi, kiểm tra kênh đang phát, tên kênh đúng rồi bấm Kết nối lại. Thư viện cộng đồng không phải API chính thức; TikTok có thể giới hạn hoặc thay đổi giao thức.

## Luật chơi

- **Người đúng đầu tiên:** bình luận đúng đến máy chủ đầu tiên thắng, chốt câu ngay. Thứ tự này có thể khác thứ tự hiển thị trên điện thoại do trễ mạng.
- **Mọi người đúng:** tất cả người trả lời đúng trước hết giờ nhận điểm; mỗi tài khoản chỉ nhận điểm một lần/câu.
- Nhận tiếng Việt có dấu/không dấu, bỏ khoảng trắng và dấu câu. Không đoán gần đúng để tránh trao điểm nhầm.
- Trắc nghiệm nhận A/B/C/D hoặc nguyên đáp án.
- Bỏ qua sự kiện bình luận trùng mã; một người gửi sai có thể sửa lại ngay, không chặn đáp án đúng liên tiếp.
- Tạm dừng dừng đồng hồ và nhận đáp án. Hiện đáp án / Câu tiếp / Dừng thao tác riêng.
- Điểm, thời lượng và chế độ mới áp dụng từ câu tiếp theo; bật/tắt tự chuyển câu áp dụng ngay.
- Top quà tính theo giá trị xu của sự kiện quà, độc lập điểm trả lời. Quà chuỗi được cộng khi kết thúc chuỗi; không phải số tiền có thể rút của streamer.
- Điểm người thử không được lưu. Chức năng giả lập bị chặn khi đang kết nối hoặc đang thử kết nối LIVE thật.

## Câu hỏi

Có sẵn **390 câu, 10 bộ, 6 loại**:

| Bộ | Số câu |
| --- | ---: |
| Đời sống | 20 |
| Ẩm thực | 20 |
| Động vật | 20 |
| Việt Nam | 20 |
| Khoa học | 20 |
| Thể thao | 15 |
| Đố vui | 10 |
| Nhìn emoji | 15 |
| Trắc nghiệm | 10 |
| Tính nhanh | 240 |

Loại: `text` (đoán đáp án), `scramble` (chữ xáo trộn), `riddle` (đố vui), `emoji`, `choice` (4 lựa chọn), `math`.

Mỗi bộ được trộn; dùng hết mới quay vòng. Có thể lọc đồng thời bộ và loại. Nếu bộ không chứa loại đang chọn, chương trình báo lỗi để chọn lại.

### Nhập bộ riêng

Bảng điều khiển → Thư viện → **Tải bộ JSON** để sao lưu, rồi chọn file JSON mới. Nhập thay toàn bộ thư viện hiện tại và dừng câu đang chơi, giữ bảng điểm. Tối đa **50.000 câu / 5 MB**. Ví dụ:

```json
[
  {
    "id": "do-vui-001",
    "category": "Bộ của tôi",
    "type": "text",
    "prompt": "Đồ vật dùng để ngồi?",
    "answer": "Cái ghế",
    "aliases": ["ghế"],
    "explanation": "Một đồ dùng quen thuộc trong nhà."
  },
  {
    "id": "chon-001",
    "category": "Bộ của tôi",
    "type": "choice",
    "prompt": "2 + 2 = ?",
    "answer": "4",
    "options": ["1", "2", "3", "4"]
  }
]
```

`id` phải duy nhất; `answer` phải có trong `options` đối với trắc nghiệm. Các cách gọi khác cần khai báo rõ trong `aliases`.

## Tốc độ và dữ liệu

- Không reload trang khi chuyển câu. Kết nối WebSocket duy trì lâu dài, gom cập nhật thường lệ 10 lần/giây; kết quả người thắng LIVE được gửi ngay.
- Bình luận được kiểm tra ngay trong bộ nhớ; chuẩn hóa đáp án một lần mỗi câu, lookup bằng `Set`.
- Chỉ gửi top 10, tối đa 20 người thắng hiển thị và số tổng; không đẩy toàn bộ người chơi ra màn hình.
- Bỏ qua gửi cho cửa sổ quá chậm, snapshot sau tự đồng bộ; heartbeat phát hiện kết nối chết, trình duyệt tự nối lại.
- Lưu nguyên tử mỗi 3 giây trong `data/runtime/state.json`, lưu thêm khi dừng bình thường. Tắt máy đột ngột có thể mất tối đa khoảng 3 giây gần nhất.
- Giữ điểm sau khởi động, nhưng buổi chơi trở về trạng thái dừng. File trạng thái lỗi được giữ lại, không ghi đè tự động.
- Giới hạn 100.000 người có điểm, cache 50.000 mã bình luận gần nhất để giới hạn bộ nhớ. Chạy LIVE nhiều ngày nên sao lưu rồi tạo buổi mới.
- Giới hạn lệnh bảng điều khiển 30/giây; không giới hạn bình luận TikTok ở mức này.

Kiểm tra:

```sh
npm test
npm run load-test
```

Phép thử tải là **100.000 câu trả lời giả lập trong tiến trình**, không bảo đảm băng thông TikTok, số người xem hay tốc độ của máy khác. Xem [phân tích mẫu và kiểm thử](docs/PHAN-TICH.md).

## Mở trên mạng LAN (tùy chọn)

Mặc định chỉ mở trên máy chạy. Nếu cần LAN, đặt `HOST=0.0.0.0`, `ADMIN_TOKEN` chuỗi ngẫu nhiên ít nhất 24 ký tự; thêm địa chỉ IP LAN máy vào `ALLOWED_HOSTS`. Ví dụ PowerShell:

```powershell
$env:HOST='0.0.0.0'
$env:ADMIN_TOKEN='THAY-BANG-CHUOI-NGAU-NHIEN-DAI-IT-NHAT-24-KY-TU'
$env:ALLOWED_HOSTS='192.168.1.10'
npm start
```

Mở bảng điều khiển bằng `http://192.168.1.10:3010/?key=MA_QUAN_TRI`. Mã được chuyển vào sessionStorage trên trình duyệt, xóa khỏi thanh địa chỉ. Không gửi mã cho người xem. Không mở cổng Internet trực tiếp; không dùng mã ví dụ làm mã thật.

Các biến khác: `PORT` (mặc định 3010), `DATA_DIR` (thư mục lưu điểm). Khi đổi PORT, mở trình duyệt thủ công theo cổng đã đặt.

## Giới hạn đã biết

Đã kiểm tra engine, máy chủ/WebSocket và giao diện bằng Chromium. **Chưa thử với phòng TikTok LIVE thật, Windows LIVE Studio hoặc OBS trên máy người dùng.** Kết nối thật phụ thuộc thư viện, quyền LIVE và mạng. Không hứa hẹn quà tặng hay thu nhập.

Nội dung câu hỏi là nội dung mới; video người dùng chỉ dùng để phân tích cách bố trí và luật chơi, không đưa video, tên hoặc avatar trong mẫu vào repo. Không dùng tài nguyên trả phí của phần mềm trong video.

Giấy phép MIT cho mã nguồn trong repo; các thư viện có giấy phép riêng.
