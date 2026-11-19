import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  supportedNode,
  loadEnvironment,
  startupMessage,
} from "./server/startup.mjs";
const root = fileURLToPath(new URL("./", import.meta.url)),
  require = createRequire(import.meta.url);
try {
  if (!supportedNode())
    throw Error(
      `Node.js ${process.versions.node} chưa được hỗ trợ. Cài Node.js 22 LTS rồi mở lại terminal.`,
    );
  loadEnvironment(root);
  const missing = ["ws", "tiktok-live-connector", "msedge-tts"].filter(
    (name) => {
      try {
        require.resolve(name);
        return false;
      } catch {
        return true;
      }
    },
  );
  if (missing.length) {
    console.log("Lần đầu chạy: đang cài thư viện bằng npm ci…");
    const npm = process.env.npm_execpath;
    if (!npm)
      throw Error("Hãy chạy bằng npm start; hoặc chạy npm install trước.");
    const result = spawnSync(
      process.execPath,
      [npm, "ci", "--no-audit", "--no-fund"],
      { cwd: root, stdio: "inherit" },
    );
    if (result.status !== 0)
      throw Error(
        "Cài thư viện chưa thành công. Kiểm tra mạng, chạy npm install rồi thử npm start.",
      );
  }
  await import("./server/index.mjs");
} catch (error) {
  console.error("\nKhông khởi động được: " + startupMessage(error));
  process.exitCode = 1;
}
