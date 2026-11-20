# Trả lời nhanh · TikTok LIVE

Game câu hỏi tương tác qua bình luận, chạy trên máy tính. Giao diện dọc tím/vàng, người trả lời đúng được cộng điểm và hiện tên. **Top quà bên trái, Top điểm bên phải.**

## Xem giao diện

[Ảnh màn hình LIVE](docs/screenshots/overlay.png) · [Ảnh bảng điều khiển](docs/screenshots/studio.png)

## Ô chữ xáo trộn theo từng từ

Các câu đoán đáp án, xếp chữ, đố vui và emoji hiển thị đúng thứ tự:

1. **Câu hỏi / gợi ý.**
2. **Hàng ô đáp án trống hoàn toàn**, không chữ, không dấu hỏi, chia nhóm theo số chữ của mỗi từ: HỒ GƯƠM → 2 ô trống, khoảng cách, 4 ô trống.
3. Nhãn **CHỮ CÁI BỊ XÁO TRỘN**.
4. **Hàng ô nhỏ riêng bên dưới**, chứa chữ cái **chỉ đảo vị trí trong từng từ**, không trộn chữ giữa các từ, giữ dấu tiếng Việt và **chia nhóm theo từng từ giống hàng ô trống**: HỒ GƯƠM → 2 ô chữ, khoảng cách, 4 ô chữ.

Ví dụ **TỦ LẠNH**: nhóm đầu chỉ chứa T, Ủ; nhóm sau chỉ chứa L, Ạ, N, H. Mỗi nhóm tự xáo riêng.

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

## Tên Top 1, đếm ngược và giọng đọc

- Dòng trên khung hỏi hiện tên người Top điểm số 1 và nhãn đỏ **Đúng +N điểm** (N là điểm mỗi câu); tên chạy ngang, vòng tròn hiển thị thời gian còn lại.
- Dòng hướng dẫn: **Gõ đáp án vào bình luận để ghi điểm . Tặng quà để lên bảng vàng**.
- Khi có người nhanh nhất, hiện kết quả ngay và đọc **“Đáp án là … [Tên người chơi] trả lời đúng.”**, một lần cho mỗi câu. Cùng lúc đếm ngược **Chuẩn bị câu mới…**. Không chờ âm thanh mới hiện kết quả.
- Trong thiết lập có **Đọc câu hỏi, đáp án và người thắng**, bật sẵn. Mỗi câu mới được đọc gợi ý một lần; trắc nghiệm đọc thêm các lựa chọn A/B/C/D. Không đọc đáp án ẩn hay các chữ xáo trộn. Khi có kết quả, câu hỏi đang đọc được ngắt để ưu tiên đáp án và người thắng. Tạm dừng, dừng hoặc chuyển câu sẽ ngắt giọng cũ. Mở cửa sổ LIVE và bấm **Bật âm thanh & giọng đọc** một lần. Bản xem trước `?audio=0` luôn im lặng.
- Mặc định giọng nữ **Microsoft Hoài My** cho câu hỏi, đáp án và tên người thắng. Dùng Hoài My trên máy nếu có; nếu không, dùng Hoài My trực tuyến qua server, cần Internet; lỗi hoặc quá thời gian sẽ hiện thông báo, không làm đứng trò chơi.
- Nếu giọng đọc không có sẵn, kiểm tra giọng tiếng Việt trong hệ điều hành/trình duyệt và kết nối mạng. Chỉ mở một nguồn có âm thanh để tránh đọc đôi.
- Đếm ngược tự chuyển vẫn theo **Nghỉ giữa câu**. Đặt khoảng **5–8 giây** nếu muốn chừa đủ thời gian đọc tên dài; không đợi xác nhận đọc xong để chuyển câu. Kết quả mới ngắt giọng cũ, không tích hàng đợi.
- Nếu đã cài bản trước: dừng ứng dụng, cập nhật repo, chạy **npm ci** để bổ sung thư viện giọng đọc rồi mở `start.bat` lại. Giữ `data/runtime` để không mất điểm.

## Cài trên Windows

1. Cài **Node.js 22 LTS** (tối thiểu 20.12) tại https://nodejs.org/ (bản LTS).
2. Tải repo: nút **Code → Download ZIP**, giải nén toàn bộ vào thư mục, ví dụ `D:\nep\tra-lo-nhanh-live`.
3. Nháy đúp **start.bat**. Lần đầu cần mạng để cài thư viện.
4. Bảng điều khiển: **http://127.0.0.1:3000**.
5. Chọn bộ / loại câu hỏi → **Bắt đầu**. Nút này lưu lựa chọn trước khi chơi.
6. Chưa LIVE: bấm **Thử đáp án đúng** hoặc nhập bình luận thử để kiểm tra.

Nếu dùng PowerShell, phải vào đúng thư mục đã clone trước khi chạy:

```powershell
git clone https://github.com/nepte6789/tra-lo-nhanh-live.git
cd tra-lo-nhanh-live
npm start
```

Nếu đã clone thì chỉ cần `cd D:\nep\tra-lo-nhanh-live` rồi `npm start`. Không chạy từ thư mục cha `D:\nep` vì ở đó không có `package.json`.

`npm start` tự cài thư viện bằng `npm ci` nếu chưa có thư viện; lần đầu cần Internet. Có thể tự chạy `npm ci` trước nếu muốn. `start.bat` cũng dùng luồng này và mở trình duyệt sau khi máy chủ sẵn sàng. Giữ cửa sổ terminal mở.

Mặc định mở cổng **3000**. Nếu cổng đang bận và chưa đặt `PORT`, ứng dụng tìm cổng trống tiếp theo tới 3010. Dùng đúng URL **Bảng điều khiển** được in trong terminal; liên kết nguồn LIVE trên bảng cũng tự theo cổng thực tế. Nếu đã đặt `PORT` mà cổng bận, ứng dụng báo lỗi để bạn đổi cổng.

Bảng điều khiển chia ba bước: **Kết nối TikTok → Chọn câu hỏi & bắt đầu → Thư viện**. Chạy thử và dữ liệu buổi chơi được thu gọn bên dưới. Trạng thái máy chủ được tách riêng với TikTok, có xem trước im lặng và nút sao chép nguồn LIVE.

### Cấu hình TikTok / EulerStream

Chép `.env.example` thành `.env` ở cạnh `package.json`:

```dotenv
PORT=3000
TIKTOK_CHANNEL=
EULERSTREAM_API_KEY=
```

Điền khóa vào `EULERSTREAM_API_KEY` nếu dịch vụ ký yêu cầu quyền; tên cũ `SIGN_API_KEY` vẫn dùng được. Không gửi khóa vào chat hay đưa `.env` lên GitHub. Khởi động lại ứng dụng sau khi sửa `.env`; bảng chỉ báo đã nạp khóa hay chưa, không gửi giá trị khóa ra trình duyệt.

Nhập link đầy đủ hoặc `@username` vào bảng điều khiển rồi **Kết nối**. Có thể nhập ngay ở terminal khi được hỏi, hoặc điền `TIKTOK_CHANNEL` để kết nối khi khởi động. Không điền tên hiển thị hoặc link rút gọn.

Bật **Tự nối lại khi mất LIVE**: kết nối ngay lần đầu, sau đó thử lại sau **2 phút** khi mất kết nối hoặc phòng chưa sẵn sàng. Nếu nhà cung cấp yêu cầu chờ lâu hơn, ứng dụng tuân theo thời gian đó. Lỗi thiếu quyền khóa hoặc bị chặn sẽ tạm dừng tự thử để sửa cấu hình. Nút **Ngắt** hủy lịch tự nối. Lỗi mạng/mã phòng tạm thời được thử nhanh thêm một lần trong mỗi lượt. Mỗi lần kết nối có timeout 30 giây.

Khóa EulerStream không bảo đảm mọi gói tài khoản đều có quyền ký yêu cầu; xem mã lỗi và quyền endpoint của tài khoản khi gặp yêu cầu Business plan.

Ứng dụng Node cũng chạy trên Linux/macOS; `start.bat` dành cho Windows. Mở lại terminal sau khi mới cài Node.

## Đưa vào TikTok LIVE Studio / OBS

- Thêm nguồn **Liên kết / Browser**: `http://127.0.0.1:3000/overlay.html`.
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

Có sẵn **668 câu, 25 bộ chủ đề, 6 loại**:

| Loại | Số câu |
| --- | ---: |
| **Xếp chữ** | **500** |
| Đoán đáp án | 93 |
| Tính nhanh | 40 |
| Nhìn emoji | 15 |
| Đố vui | 10 |
| Trắc nghiệm | 10 |

Xếp chữ có các chủ đề: đời sống, đồ dùng gia đình, nhà bếp, rau củ và trái cây, cây và hoa, động vật, chim và côn trùng, món ăn Việt, nghề nghiệp, học tập, thiên nhiên, giao thông, nhạc cụ, thể thao, thế giới và văn hóa. Đáp án Xếp chữ không trùng sau khi chuẩn hóa dấu/khoảng trắng. Tính nhanh đã giảm từ 240 xuống 40 câu, vẫn có cộng, nhân và chia. Các câu Đoán đáp án cũ được giữ lại để thiết lập đang dùng không bị mất bộ.

**Cập nhật bộ mới:** khởi động lại ứng dụng sau khi cập nhật repo. Nếu trước đây đã nhập bộ riêng, ứng dụng tiếp tục dùng bộ riêng đó; muốn dùng toàn bộ ngân hàng mới, sao lưu bằng **Tải bộ JSON**, rồi nhập file **`data/questions.json`** từ repo. Không cần xóa `data/runtime`.

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

Mở bảng điều khiển bằng `http://192.168.1.10:3000/?key=MA_QUAN_TRI`. Mã được chuyển vào sessionStorage trên trình duyệt, xóa khỏi thanh địa chỉ. Không gửi mã cho người xem. Không mở cổng Internet trực tiếp; không dùng mã ví dụ làm mã thật.

Các biến khác: `PORT` (mặc định 3000), `DATA_DIR` (thư mục lưu điểm), `OPEN_BROWSER=1` (mở trình duyệt sau khi khởi động). Các cấu hình này đều có thể đặt trong `.env`. Giữ nguyên `data/runtime` khi cập nhật để giữ điểm và bộ câu hỏi riêng.

## Giới hạn đã biết

Đã kiểm tra engine, máy chủ/WebSocket và giao diện bằng Chromium. **Chưa thử với phòng TikTok LIVE thật, Windows LIVE Studio hoặc OBS trên máy người dùng.** Kết nối thật phụ thuộc thư viện, quyền LIVE và mạng. Không hứa hẹn quà tặng hay thu nhập.

Nội dung câu hỏi là nội dung mới; video người dùng chỉ dùng để phân tích cách bố trí và luật chơi, không đưa video, tên hoặc avatar trong mẫu vào repo. Không dùng tài nguyên trả phí của phần mềm trong video.

Giấy phép MIT cho mã nguồn trong repo; các thư viện có giấy phép riêng.

## Khi báo “Kết nối lỗi” dù kênh đang LIVE

Nhập đúng **tên người dùng** từ hồ sơ (ví dụ `@tenkenh`), không dùng tên hiển thị. Hỗ trợ cả link đầy đủ `https://www.tiktok.com/@tenkenh/live`, không dùng link rút gọn `vt.tiktok.com`.

Bản hiện tại hiển thị khung lỗi ngay dưới ô tên kênh, có mã, chi tiết và nút **Sao chép lỗi**. Nội dung nhạy cảm được ẩn trước khi gửi lên giao diện hoặc ghi log. Các nhóm lỗi:

| Mã | Ý nghĩa và cách kiểm tra |
| --- | --- |
| `ROOM_ID` | Chưa lấy được mã phòng; kiểm tra @, đợi 20–30 giây sau khi phát rồi thử lại. Cũng có thể do TikTok chặn/đổi giao thức. |
| `OFFLINE` | TikTok trả về chưa LIVE; không khẳng định người dùng chưa phát, cần kiểm tra trang LIVE công khai và đúng tên kênh. |
| `RATE_LIMIT` | Dịch vụ ký giới hạn lượt; đợi theo thông báo, không bấm liên tục. |
| `SIGN_PERMISSION` / `SIGN_SERVER` | Quyền hoặc phản hồi của dịch vụ ký; xem chi tiết trước khi thay đổi cấu hình. |
| `BLOCKED` | Truy cập từ máy/mạng bị chặn; kiểm tra trang LIVE trong trình duyệt và cấu hình mạng/VPN/proxy. |
| `NETWORK` | Lỗi mạng, DNS hoặc timeout. |
| `UNKNOWN` | Sao chép lỗi để kiểm tra, không đoán nguyên nhân. |

Lỗi mã phòng/mạng tạm thời được tự thử nhanh thêm **một lần**; lịch tự nối 2 phút là lớp riêng, có nút Ngắt để hủy. Lỗi quyền/chặn tạm dừng lịch tự nối; giới hạn lượt được chờ theo thời gian nhà cung cấp. Khi kết nối, bỏ tải danh sách quà mở rộng; sự kiện quà vẫn lấy giá trị từ `giftDetails`.

Nếu có khóa Euler Stream do bạn tự quản lý, đặt `EULERSTREAM_API_KEY` trong `.env` trên máy (`SIGN_API_KEY` cũ vẫn được hỗ trợ). Không cần gửi khóa vào chat; đây không phải cookie hay mật khẩu TikTok. Không cần mua khóa trước khi biết mã lỗi.

Bản này chỉ cải thiện kết nối và chẩn đoán. Chưa xác minh khắc phục được lỗi của máy người dùng nếu chưa có chi tiết thực tế.
