import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Mẫu "đồng bộ state từ props" được dùng có chủ đích ở một số component; để cảnh báo thay vì lỗi.
      "react-hooks/set-state-in-effect": "warn",
      // Ảnh do người dùng tải lên (avatar/logo) hiển thị bằng <img> để tránh cấu hình domain động.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
