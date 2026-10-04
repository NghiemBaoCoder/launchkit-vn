export interface ParsedUserAgent {
  browser: string;
  os: string;
  mobile: boolean;
  /** "Chrome · Windows" */
  label: string;
}

/** Phân tích user-agent ở mức thô (trình duyệt / hệ điều hành) để hiển thị phiên đăng nhập. */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  const s = ua ?? "";
  let browser: string;
  if (!s) browser = "Không rõ";
  else if (/HeadlessChrome/.test(s)) browser = "Chrome (headless)";
  else if (/Edg\//.test(s)) browser = "Microsoft Edge";
  else if (/OPR\//.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/CriOS/.test(s)) browser = "Chrome";
  else if (/FxiOS/.test(s)) browser = "Firefox";
  else if (/Chromium/.test(s)) browser = "Chromium";
  else if (/Chrome\//.test(s)) browser = "Chrome";
  else if (/Firefox\//.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = "Safari";
  // Đăng nhập qua server action → GoTrue ghi user-agent của Node (fetch/undici), không phải của trình duyệt.
  else if (/^(node|undici)\b/i.test(s)) browser = "Đăng nhập web";
  else if (/axios|curl|python|postman|okhttp|go-http/i.test(s)) browser = "Ứng dụng / API";
  else browser = "Trình duyệt khác";

  let os = "Không rõ";
  if (/Windows/.test(s)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(s)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/Android/.test(s)) os = "Android";
  else if (/CrOS/.test(s)) os = "ChromeOS";
  else if (/Linux/.test(s)) os = "Linux";

  const mobile = /Mobile|Android|iPhone|iPad|iPod/.test(s);
  return { browser, os, mobile, label: `${browser} · ${os}` };
}
