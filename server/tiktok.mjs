// No password/cookie/session is requested. This connector reads public LIVE events.
export function eventUser(e, aliases) {
  const u = e.user || e.userInfo || e.common?.user || e;
  const ids = [
    u.userId,
    u.user_id,
    u.idStr,
    u.id,
    u.uniqueId,
    u.unique_id,
    u.displayId,
    u.secUid,
    e.userId,
    e.user_id,
    e.uniqueId,
  ]
    .filter(
      (v) =>
        v !== undefined && v !== null && String(v).trim() && String(v) !== "0",
    )
    .map(String);
  if (!ids.length) return null;
  const id = ids.map((x) => aliases?.get(x)).find(Boolean) || ids[0];
  for (const key of ids) aliases?.set(key, id);
  while (aliases?.size > 100000) aliases.delete(aliases.keys().next().value);
  const image =
    u.profilePictureUrl ||
    u.profilePicture ||
    u.avatarLarge ||
    u.avatarThumb ||
    u.avatar ||
    "";
  const url =
    typeof image === "string"
      ? image
      : image.urlList || image.url_list || image.url || "";
  return {
    id,
    name:
      u.nickname ||
      u.nickName ||
      u.uniqueId ||
      u.displayId ||
      e.nickname ||
      "Người xem",
    avatar: Array.isArray(url) ? url[0] || "" : url,
  };
}
export function chatData(e, aliases) {
  const u = eventUser(e, aliases);
  if (!u) return null;
  const mid = e.msgId || e.common?.msgId;
  const rawTime = Number(e.common?.createTime ?? e.createTime);
  const sentAt =
    Number.isFinite(rawTime) && rawTime > 0
      ? rawTime < 1e12
        ? rawTime * 1000
        : rawTime
      : undefined;
  return {
    ...u,
    text:
      [e.comment, e.text, e.content, e.comment?.text].find(
        (x) => typeof x === "string",
      ) || "",
    msgId: mid && String(mid) !== "0" ? String(mid) : undefined,
    sentAt,
    timePrecision: rawTime < 1e12 ? 1000 : 1,
  };
}
export function giftData(e, aliases) {
  const u = eventUser(e, aliases);
  if (!u) return null;
  const details = e.giftDetails || e.extendedGiftInfo || e.gift || {};
  const type = Number(details.giftType ?? details.gift_type ?? e.giftType);
  if (type === 1 && !e.repeatEnd) return null;
  const diamonds =
    Number(
      details.diamondCount ?? details.diamond_count ?? e.diamondCount ?? 0,
    ) * (Number(e.repeatCount) || 1);
  const group =
      e.groupId && String(e.groupId) !== "0" ? String(e.groupId) : null,
    mid = e.msgId || e.common?.msgId;
  return {
    ...u,
    diamonds,
    key: group
      ? `${u.id}:${e.giftId}:${group}`
      : mid && String(mid) !== "0"
        ? String(mid)
        : null,
  };
}
export function connectionOptions(env = process.env) {
  const key =
    String(env.EULERSTREAM_API_KEY || "").trim() ||
    String(env.SIGN_API_KEY || "").trim();
  return {
    enableExtendedGiftInfo: false,
    processInitialData: false,
    ...(key ? { signApiKey: key } : {}),
  };
}
export function normalizeUsername(value) {
  let name = String(value || "").trim();
  if (/^https?:\/\//i.test(name)) {
    let u;
    try {
      u = new URL(name);
    } catch {
      throw Error("Đường link TikTok không hợp lệ.");
    }
    if (!["tiktok.com", "www.tiktok.com", "m.tiktok.com"].includes(u.hostname))
      throw Error("Hãy nhập @tên_kênh hoặc link tiktok.com/@tên_kênh/live.");
    name = u.pathname.match(/^\/@([^/]+)/)?.[1] || "";
  }
  name = name.replace(/^@/, "");
  if (!/^[a-zA-Z0-9_.]{2,32}$/.test(name))
    throw Error(
      "Nhập @tên_kênh ở hồ sơ TikTok, không phải tên hiển thị hay link rút gọn.",
    );
  return name;
}
function safeDetail(s) {
  let raw = String(s || "");
  for (const secret of [
    process.env.EULERSTREAM_API_KEY,
    process.env.SIGN_API_KEY,
  ])
    if (secret?.trim()) raw = raw.split(secret.trim()).join("[đã ẩn]");
  return raw
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer[REDACTED]")
    .replace(/https?:\/\/[^\s<>"']+/gi, (u) => {
      try {
        return new URL(u).origin;
      } catch {
        return "[đường dẫn]";
      }
    })
    .replace(
      /(["']?(?:api[_-]?key|signApiKey|token|sessionid|cookie|authorization|password)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&]+)/gi,
      "$1[đã ẩn]",
    )
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [đã ẩn]")
    .replace(/[\u0000-\u001f]/g, " ")
    .slice(0, 700);
}
export function connectionError(error) {
  const queue = [error],
    seen = new Set(),
    parts = [];
  let status = 0,
    retryAfter = 0;
  while (queue.length && seen.size < 10) {
    const e = queue.shift();
    if (!e || seen.has(e)) continue;
    seen.add(e);
    if (typeof e === "string") {
      parts.push(e);
      continue;
    }
    parts.push(
      e.constructor?.name || "",
      e.name || "",
      e.message || "",
      e.info || "",
      e.code || "",
      e.reason || "",
    );
    status = Number(
      e.statusCode || e.response?.statusCode || e.response?.status || status,
    );
    retryAfter = Math.max(retryAfter, Number(e.retryAfter) || 0);
    for (const k of ["cause", "exception", "error"]) if (e[k]) queue.push(e[k]);
    if (Array.isArray(e.errors)) queue.push(...e.errors);
  }
  const raw = parts.filter(Boolean).join(" · "),
    text = raw.toLowerCase();
  let code = "UNKNOWN",
    message = "Chưa kết nối được với TikTok.",
    help = "Sao chép thông tin lỗi bên dưới để kiểm tra đúng nguyên nhân.",
    retryable = false;
  if (
    status === 429 ||
    /ratelimit|rate.?limit|rate limited|too many requests/.test(text)
  ) {
    code = "RATE_LIMIT";
    message = "Dịch vụ kết nối đang giới hạn lượt truy cập.";
    help = retryAfter
      ? `Đợi ít nhất ${Math.ceil(retryAfter / 1000)} giây rồi thử lại.`
      : "Đợi vài phút rồi kết nối lại; không bấm liên tục. Nếu có khóa Euler Stream riêng, điền EULERSTREAM_API_KEY trong .env trên máy.";
  } else if (
    /useroffline|isn.t online|not live|not online|offline/.test(text)
  ) {
    code = "OFFLINE";
    message = "TikTok đang trả về trạng thái kênh chưa LIVE.";
    help =
      "Kiểm tra đúng @tên_kênh, mở trang LIVE công khai trong trình duyệt, đợi 20–30 giây sau khi phát rồi thử lại.";
  } else if (
    status === 401 ||
    /unauthori|invalid api.?key|missing api.?key|lack of permission|business plan|premiumfeature|forbidden.*euler/.test(
      text,
    )
  ) {
    code = "SIGN_PERMISSION";
    message = "Dịch vụ ký kết nối từ chối quyền truy cập.";
    help =
      "Đây là quyền dịch vụ kết nối, không phải mật khẩu TikTok. Cần xem chi tiết lỗi và kiểm tra cấu hình Euler Stream; không gửi cookie hoặc mã đăng nhập.";
  } else if (
    status === 403 ||
    /captcha|blocked|access denied|forbidden/.test(text)
  ) {
    code = "BLOCKED";
    message = "Yêu cầu từ máy này bị TikTok hoặc dịch vụ kết nối chặn.";
    help =
      "Mở trang LIVE trong trình duyệt để kiểm tra khả năng truy cập, kiểm tra VPN/proxy và mạng. Không cần cung cấp mật khẩu hay cookie cho ứng dụng.";
  } else if (/room.?id|sigi_state|liveroom object/.test(text)) {
    code = "ROOM_ID";
    message = "Chưa lấy được mã phòng LIVE từ TikTok.";
    help =
      "Kiểm tra đúng tên người dùng (không phải tên hiển thị). Nếu đang LIVE, đợi 20–30 giây rồi thử lại; cũng có thể do TikTok thay đổi hoặc chặn truy cập.";
    retryable = true;
  } else if (
    /timeout|timed out|etimedout|econnreset|enotfound|eai_again|econnrefused|socket hang up|network/.test(
      text,
    )
  ) {
    code = "NETWORK";
    message = "Kết nối mạng tới TikTok hoặc máy chủ ký bị lỗi hoặc quá hạn.";
    help = "Kiểm tra mạng, DNS và VPN/proxy; sau đó thử kết nối lại.";
    retryable = true;
  } else if (/signapi|signature|sign error|missing cursor/.test(text)) {
    code = "SIGN_SERVER";
    message = "Dịch vụ ký chưa trả về kết nối LIVE hợp lệ.";
    help =
      "Đợi một lúc rồi thử lại. Nếu vẫn lỗi, gửi mã lỗi và chi tiết đã ẩn thông tin nhạy cảm để kiểm tra.";
  }
  return {
    code,
    error: message,
    detail: safeDetail(raw) || "Thư viện không cung cấp thông tin chi tiết.",
    help,
    retryable,
    retryAfterMs: Math.max(0, Math.min(86400000, retryAfter)),
  };
}
export class LiveLink {
  constructor(
    game,
    changed,
    {
      createClient,
      delay = (ms) => new Promise((r) => setTimeout(r, ms)),
      maxAttempts = 2,
      connectTimeout = 30000,
      onDisconnected = () => {},
    } = {},
  ) {
    Object.assign(this, {
      createClient,
      delay,
      maxAttempts,
      connectTimeout,
      onDisconnected,
    });
    this.game = game;
    this.changed = changed;
    this.state = { status: "idle" };
    this.generation = 0;
    this.gifts = new Map();
    this.aliases = new Map();
  }
  async connect(value) {
    const username = normalizeUsername(value);
    await this.disconnect();
    const gen = ++this.generation;
    this.game.setLive(true);
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      if (gen !== this.generation) return;
      this.state = {
        status: attempt === 1 ? "connecting" : "retrying",
        username,
        attempt,
      };
      this.changed();
      let c;
      try {
        // Gift events already include giftDetails. The extra gift-gallery request can fail independently of chat.
        const options = connectionOptions();
        if (this.createClient) c = await this.createClient(username, options);
        else {
          const { TikTokLiveConnection } = await import(
            "tiktok-live-connector"
          );
          c = new TikTokLiveConnection(username, options);
        }
        if (gen !== this.generation) {
          await c.disconnect();
          return;
        }
        this.client = c;
        const current = () => gen === this.generation && this.client === c;
        c.on("chat", (e) => {
          if (!current() || this.state.status !== "connected") return;
          const data = chatData(e, this.aliases);
          if (data && this.game.comment(data)) this.changed("winner");
        });
        c.on("gift", (e) => {
          if (!current() || this.state.status !== "connected") return;
          const data = giftData(e, this.aliases);
          if (!data) return;
          if (data.key) {
            if (this.gifts.has(data.key)) return;
            this.gifts.set(data.key, 1);
            if (this.gifts.size > 10000)
              this.gifts.delete(this.gifts.keys().next().value);
          }
          this.game.gift(data);
        });
        c.on("disconnected", () => {
          if (current() && this.state.status === "connected") {
            this.game.setLive(false);
            this.state = {
              status: "disconnected",
              username,
              error: "Mất kết nối. Bấm Kết nối lại.",
              code: "DISCONNECTED",
              help: "Kiểm tra kênh còn đang LIVE và kết nối lại.",
            };
            this.changed();
            this.onDisconnected();
          }
        });
        c.on("error", (error) => {
          if (current()) {
            const info = connectionError(error);
            this.state = { ...this.state, ...info };
            if (this.state.status === "connected" && c.isConnected === false) {
              this.game.setLive(false);
              this.state.status = "disconnected";
              this.onDisconnected();
            }
            this.changed();
          }
        });
        let timer;
        try {
          await Promise.race([
            c.connect(),
            new Promise((_, reject) => {
              timer = setTimeout(
                () => reject(Error("TikTok connection timeout")),
                this.connectTimeout,
              );
            }),
          ]);
        } finally {
          clearTimeout(timer);
        }
        if (!current()) {
          await c.disconnect();
          return;
        }
        this.state = { status: "connected", username, attempt };
        this.changed();
        return;
      } catch (error) {
        if (gen !== this.generation) return;
        this.client = null;
        try {
          await c?.disconnect();
        } catch {}
        const info = connectionError(error);
        console.warn(`[TikTok ${info.code}] ${info.detail}`);
        if (info.retryable && attempt < this.maxAttempts) {
          this.state = {
            status: "retrying",
            username,
            attempt,
            ...info,
            help: info.help + " Đang thử lại một lần…",
          };
          this.changed();
          await this.delay(1200);
          continue;
        }
        this.game.setLive(false);
        this.state = { status: "error", username, attempt, ...info };
        this.changed();
        return;
      }
    }
  }
  async disconnect() {
    this.game.setLive(false);
    ++this.generation;
    const c = this.client;
    this.client = null;
    try {
      await c?.disconnect();
    } catch {}
    this.state = { status: "idle" };
    this.changed();
  }
}
