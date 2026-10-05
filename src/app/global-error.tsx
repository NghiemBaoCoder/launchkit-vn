"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Đã có lỗi nghiêm trọng</h1>
          <p style={{ color: "#64748b", marginTop: 12 }}>Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang.</p>
          {error.digest ? <p style={{ fontFamily: "monospace", fontSize: 12, marginTop: 8 }}>Mã lỗi: {error.digest}</p> : null}
          <button onClick={reset} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: 0, cursor: "pointer" }}>Tải lại</button>
        </div>
      </body>
    </html>
  );
}
