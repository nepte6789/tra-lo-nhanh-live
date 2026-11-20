const $ = (id) => document.getElementById(id),
  form = $("settingsForm"),
  qs = new URLSearchParams(location.search);
if (qs.has("key")) {
  sessionStorage.setItem("adminKey", qs.get("key"));
  qs.delete("key");
  history.replaceState(null, "", location.pathname + (qs.size ? "?" + qs : ""));
}
const key = sessionStorage.getItem("adminKey") || "",
  typeNames = {
    text: "Đoán đáp án",
    scramble: "Xếp chữ",
    math: "Tính nhanh",
    choice: "Trắc nghiệm",
    riddle: "Đố vui",
    emoji: "Nhìn emoji",
  };
let ws,
  state,
  filled = false,
  retry = 500,
  ackSettings = false,
  requestId = 0,
  offset = 0,
  channelEdited = false;
const pending = new Map();
try {
  $("username").value = localStorage.getItem("tra-lo-nhanh.username") || "";
} catch {}
$("username").oninput = () => (channelEdited = true);
function notice(text, error = false) {
  $("notice").textContent = text;
  $("notice").classList.toggle("error", error);
}
function request(cmd, data = {}) {
  if (ws?.readyState !== 1)
    return Promise.reject(Error("Mất kết nối máy chủ. Đang thử nối lại."));
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(Error("Máy chủ chưa phản hồi. Kiểm tra cửa sổ npm start."));
    }, cmd === "connect" ? 75000 : 15000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ cmd, ...data, requestId: id }));
  });
}
async function action(cmd, data = {}) {
  try {
    await request(cmd, data);
    notice("Đã thực hiện.");
  } catch (e) {
    notice(e.message, true);
  }
}
function fill(settings) {
  for (const [k, v] of Object.entries(settings)) {
    const el = form.elements[k];
    if (!el) continue;
    if (el.type === "checkbox") el.checked = v;
    else el.value = v;
  }
  filled = true;
}
function readSettings() {
  const data = Object.fromEntries(new FormData(form));
  for (const k of ["auto", "sound", "speech"])
    data[k] = form.elements[k].checked;
  return data;
}
function countdown() {
  if (!state) return;
  const a = state.live.auto || {};
  if (a.phase === "blocked") {
    $("autoCountdown").textContent =
      "Tạm dừng tự thử lại: sửa khóa/quyền kết nối theo khung lỗi rồi bấm Kết nối.";
    return;
  }
  $("autoCountdown").textContent = a.enabled
    ? a.nextAttemptAt
      ? `${a.phase === "connecting" ? "Đang kết nối" : "Lần thử tiếp theo"} sau ${Math.max(0, Math.ceil((a.nextAttemptAt - Date.now() - offset) / 1000))} giây · @${a.target}`
      : a.phase === "connecting"
        ? `Đang kết nối @${a.target}…`
        : "Tự nối lại sau 2 phút nếu mất LIVE."
    : "Nhập kênh đang LIVE. Có thể chạy thử khi chưa kết nối.";
}
function render(m) {
  state = m;
  offset = m.serverTime - Date.now();
  if (!filled || ackSettings) {
    fill(m.settings);
    ackSettings = false;
  }
  $("roundNumber").textContent = m.round;
  $("phaseText").textContent = m.paused
    ? "Tạm dừng"
    : {
        idle: "Chưa bắt đầu",
        question: "Đang nhận đáp án",
        reveal: "Đang hiện kết quả",
      }[m.phase];
  $("comments").textContent = m.stats.comments.toLocaleString("vi-VN");
  $("accepted").textContent = m.stats.accepted.toLocaleString("vi-VN");
  $("players").textContent = `${m.stats.players} người có điểm`;
  $("currentPrompt").textContent =
    m.question?.prompt || "Chọn bộ câu hỏi và bấm Bắt đầu";
  $("currentCategory").textContent = m.question
    ? `${m.question.category} · ${typeNames[m.question.type]}`
    : "CÂU HỎI HIỆN TẠI";
  $("currentAnswer").textContent = m.question?.answer
    ? `Đáp án: ${m.question.answer}`
    : m.phase === "question"
      ? "Đang nhận đáp án…"
      : "";
  $("pause").textContent = m.paused ? "▶ Tiếp tục" : "Ⅱ Tạm dừng";
  $("pause").disabled = m.phase !== "question";
  $("reveal").disabled = m.phase !== "question";
  $("next").disabled = m.phase === "idle";
  $("stop").disabled = m.phase === "idle";
  const labels = {
    idle: "TikTok: chưa kết nối",
    connecting: "TikTok: đang kết nối…",
    retrying: "TikTok: đang thử lại…",
    connected: "TikTok: đã kết nối ✓",
    disconnected: "TikTok: mất kết nối",
    error: "TikTok: kết nối lỗi",
  };
  $("tiktokStatus").textContent = labels[m.live.status] || m.live.status;
  $("tiktokStatus").classList.toggle(
    "connected",
    m.live.status === "connected",
  );
  $("tiktokStatus").classList.toggle(
    "failed",
    ["error", "disconnected"].includes(m.live.status),
  );
  $("liveChannel").textContent = m.live.username
    ? "@" + m.live.username
    : "Chạy thử trước khi lên sóng";
  if (
    m.live.username &&
    !channelEdited &&
    document.activeElement !== $("username")
  )
    $("username").value = "@" + m.live.username;
  $("keyStatus").textContent = m.live.hasApiKey
    ? "● Đã nạp khóa EulerStream trên máy"
    : "Chưa nạp khóa EulerStream";
  $("connectionDetails").classList.toggle("hidden", !m.live.error);
  $("liveErrorTitle").textContent = m.live.error
    ? `[${m.live.code || "TIKTOK"}] ${m.live.error}`
    : "";
  $("liveErrorHelp").textContent = m.live.help || "";
  $("liveErrorDetail").textContent = m.live.detail || "";
  const busy =
    ["connected", "connecting", "retrying"].includes(m.live.status) ||
    m.live.auto?.enabled;
  for (const id of ["sendDemo", "correctDemo", "giftDemo"])
    $(id).disabled = !!busy;
  $("demoHint").textContent = busy
    ? "Đang kết nối hoặc tự thử lại LIVE thật. Bấm Ngắt trước khi dùng dữ liệu thử."
    : "Điểm thử không lưu sau khi khởi động lại. Mở câu hỏi rồi thử đáp án.";
  $("connectBtn").disabled = ["connecting", "retrying"].includes(m.live.status);
  form.elements.mode.disabled = !!busy;
  countdown();
}
function catalog(m) {
  const category = form.elements.category.value,
    type = form.elements.type.value;
  $("bankCount").textContent = m.total;
  $("categoryCount").textContent =
    `${m.categories.length} bộ · ${m.types.length} loại`;
  for (const [id, values, first, labels] of [
    ["categorySelect", m.categories, "Tất cả bộ câu hỏi", null],
    ["typeSelect", m.types, "Tất cả loại", typeNames],
  ]) {
    const select = $(id);
    select.replaceChildren(new Option(first, "all"));
    for (const value of values)
      select.add(
        new Option(labels?.[value] || `${value} (${m.counts[value]})`, value),
      );
  }
  form.elements.category.value = m.categories.includes(category)
    ? category
    : "all";
  form.elements.type.value = m.types.includes(type) ? type : "all";
  $("bankChips").replaceChildren();
  for (const category of m.categories) {
    const el = document.createElement("span"),
      b = document.createElement("b");
    el.className = "bank-chip";
    el.append(document.createTextNode(category));
    b.textContent = m.counts[category];
    el.append(b);
    $("bankChips").append(el);
  }
  if (state) fill(state.settings);
}
function connect() {
  ws = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws?role=control&key=${encodeURIComponent(key)}`,
  );
  ws.onopen = () => {
    retry = 500;
    $("serverStatus").textContent = "● Máy chủ: sẵn sàng";
    $("serverStatus").classList.add("connected");
    notice("Sẵn sàng. Kết nối kênh hoặc chọn bộ câu hỏi để chạy thử.");
  };
  ws.onclose = () => {
    $("serverStatus").textContent = "● Máy chủ: mất kết nối";
    $("serverStatus").classList.remove("connected");
    $("tiktokStatus").textContent = "TikTok: chờ máy chủ xác nhận";
    $("tiktokStatus").classList.remove("connected", "failed");
    notice(
      "Đang nối lại máy chủ. Giữ cửa sổ npm start mở; nếu dùng LAN, kiểm tra mã quản trị.",
      true,
    );
    for (const p of pending.values()) {
      clearTimeout(p.timer);
      p.reject(Error("Máy chủ mất kết nối."));
    }
    pending.clear();
    setTimeout(connect, retry);
    retry = Math.min(10000, retry * 1.8);
  };
  ws.onmessage = (e) => {
    let m;
    try {
      m = JSON.parse(e.data);
    } catch {
      return;
    }
    if (m.t === "state") render(m);
    if (m.t === "catalog") catalog(m);
    if (m.t === "ok" || m.t === "error") {
      const p = pending.get(m.requestId);
      if (p) {
        pending.delete(m.requestId);
        clearTimeout(p.timer);
        m.t === "ok" ? p.resolve(m) : p.reject(Error(m.error));
      } else if (m.t === "error") notice(m.error, true);
    }
  };
}
connect();
setInterval(countdown, 250);
$("sourceUrl").textContent = location.origin + "/overlay.html";
$("copyUrl").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("sourceUrl").textContent);
    notice("Đã sao chép liên kết màn hình LIVE.");
  } catch {
    notice("Sao chép liên kết hiển thị ở cột màn hình LIVE.");
  }
};
for (const cmd of ["next", "pause", "reveal", "stop"])
  $(cmd).onclick = () => action(cmd);
$("start").onclick = async () => {
  if (!form.reportValidity()) return;
  $("start").disabled = true;
  try {
    await request("settings", { settings: readSettings() });
    ackSettings = true;
    await request("start");
    notice(
      "Đã lưu lựa chọn và bắt đầu câu hỏi. Mở màn hình LIVE để bật âm thanh.",
    );
  } catch (e) {
    notice(e.message, true);
  } finally {
    $("start").disabled = false;
  }
};
form.onsubmit = async (e) => {
  e.preventDefault();
  try {
    await request("settings", { settings: readSettings() });
    ackSettings = true;
    notice("Đã lưu thiết lập.");
  } catch (e) {
    notice(e.message, true);
  }
};
$("connectBtn").onclick = async () => {
  try {
    const username = $("username").value.trim();
    if (!username)
      throw Error("Nhập @username hoặc link kênh TikTok đang LIVE.");
    await request("connect", {
      username,
      autoReconnect: $("autoReconnect").checked,
    });
    try {
      localStorage.setItem("tra-lo-nhanh.username", username);
    } catch {}
    notice("Đã gửi yêu cầu kết nối. Theo dõi trạng thái TikTok phía trên.");
  } catch (e) {
    notice(e.message, true);
  }
};
$("username").onkeydown = (e) => {
  if (e.key === "Enter") $("connectBtn").click();
};
$("disconnectBtn").onclick = () => action("disconnect");
$("sendDemo").onclick = () =>
  action("simulate", {
    name: $("demoName").value,
    text: $("demoAnswer").value,
    round: state?.round,
  });
$("demoAnswer").onkeydown = (e) => {
  if (e.key === "Enter") $("sendDemo").click();
};
$("correctDemo").onclick = () =>
  action("demoCorrect", { name: $("demoName").value, round: state?.round });
$("giftDemo").onclick = () =>
  action("demoGift", { name: $("demoName").value, diamonds: 10 });
$("resetBtn").onclick = () => {
  const confirm = prompt("Xóa toàn bộ điểm và Top quà? Gõ XÓA để xác nhận.");
  if (confirm === "XÓA") action("reset", { confirm });
};
const headers = () => (key ? { Authorization: `Bearer ${key}` } : {});
$("exportBank").onclick = async () => {
  try {
    const r = await fetch("/api/bank", { headers: headers() });
    if (!r.ok) throw Error("Không tải được bộ câu hỏi");
    const blob = await r.blob(),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "questions.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    notice(e.message, true);
  }
};
$("importBank").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    notice("File tối đa 5 MB.", true);
    return;
  }
  if (
    !confirm(
      "Thay thư viện bằng file này? Nên tải JSON hiện tại để sao lưu trước.",
    )
  )
    return;
  try {
    const r = await fetch("/api/bank", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: await file.text(),
    });
    const result = await r.json();
    if (!r.ok) throw Error(result.error);
    filled = false;
    notice(`Đã nhập ${result.total} câu hỏi. Bấm Bắt đầu để chơi.`);
  } catch (e) {
    notice(e.message, true);
  } finally {
    e.target.value = "";
  }
};
$("copyLiveError").onclick = async () => {
  const text = [
    $("liveErrorTitle").textContent,
    $("liveErrorHelp").textContent,
    $("liveErrorDetail").textContent,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    notice("Đã sao chép lỗi.");
  } catch {
    notice("Sao chép nội dung lỗi trong khung kết nối.");
  }
};
