import { existsSync } from "node:fs";
import { resolve } from "node:path";
export function supportedNode(version = process.versions.node) {
  const [major, minor] = version.split(".").map(Number);
  return major > 20 || (major === 20 && minor >= 12);
}
export function loadEnvironment(root) {
  if (existsSync(resolve(root, ".env"))) {
    if (!process.loadEnvFile)
      throw Error(
        "Cần Node.js 20.12+ để đọc .env; khuyên dùng Node.js 22 LTS.",
      );
    process.loadEnvFile(resolve(root, ".env"));
  }
}
export function serverPort(env = process.env) {
  const value =
    env.PORT === undefined || env.PORT === "" ? 3000 : Number(env.PORT);
  if (!Number.isInteger(value) || value < 1 || value > 65535)
    throw Error("PORT phải là số nguyên từ 1 đến 65535 trong .env.");
  return value;
}
export function startupMessage(error) {
  if (error.code === "EADDRINUSE")
    return "Cổng đang được dùng. Dừng ứng dụng cũ bằng Ctrl+C hoặc đổi PORT trong .env.";
  if (["EACCES", "EPERM"].includes(error.code))
    return "Không có quyền mở cổng hoặc ghi dữ liệu. Chọn thư mục khác bằng DATA_DIR trong .env.";
  if (
    error.code === "ERR_MODULE_NOT_FOUND" ||
    error.code === "MODULE_NOT_FOUND"
  )
    return "Thiếu thư viện. Chạy npm install trong thư mục tra-lo-nhanh-live rồi npm start.";
  return error.message;
}
