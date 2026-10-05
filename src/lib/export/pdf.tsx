import "server-only";
import path from "node:path";
import React from "react";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Block, Outline } from "./outline";

let registered = false;
function ensureFonts() {
  if (registered) return;
  const dir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "BeVietnam",
    fonts: [
      { src: path.join(dir, "BeVietnamPro-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "BeVietnamPro-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // Không ngắt từ tiếng Việt bằng dấu gạch
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

const styles = StyleSheet.create({
  page: { fontFamily: "BeVietnam", fontSize: 10, paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, color: "#0f172a", lineHeight: 1.45 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#312e81" },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 16 },
  h1: { fontSize: 15, fontWeight: 700, marginTop: 18, marginBottom: 6, color: "#312e81", borderBottomWidth: 1, borderBottomColor: "#c7d2fe", paddingBottom: 3 },
  h2: { fontSize: 12.5, fontWeight: 700, marginTop: 12, marginBottom: 4, color: "#1e1b4b" },
  h3: { fontSize: 11, fontWeight: 700, marginTop: 8, marginBottom: 2 },
  small: { fontSize: 9, fontWeight: 700, color: "#64748b", marginTop: 5, marginBottom: 1, textTransform: "uppercase" },
  p: { marginBottom: 4 },
  kv: { flexDirection: "row", marginBottom: 2 },
  kvLabel: { width: 130, color: "#64748b" },
  kvValue: { flex: 1 },
  bullet: { flexDirection: "row", marginBottom: 1.5, paddingLeft: 6 },
  bulletDot: { width: 10 },
  table: { marginVertical: 6, borderWidth: 1, borderColor: "#e2e8f0" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  th: { flex: 1, padding: 4, backgroundColor: "#eef2ff", fontWeight: 700, fontSize: 9 },
  td: { flex: 1, padding: 4, fontSize: 9 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginVertical: 8 },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
});

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "h1": return <Text style={styles.h1}>{b.text}</Text>;
    case "h2": return <Text style={styles.h2}>{b.text}</Text>;
    case "h3": return <Text style={styles.h3}>{b.text}</Text>;
    case "small": return <Text style={styles.small}>{b.text}</Text>;
    case "p": return <Text style={styles.p}>{b.text}</Text>;
    case "kv": return (<View style={styles.kv}><Text style={styles.kvLabel}>{b.label}</Text><Text style={styles.kvValue}>{b.value}</Text></View>);
    case "bullets": return (<View>{b.items.map((it, i) => (<View key={i} style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={{ flex: 1 }}>{it}</Text></View>))}</View>);
    case "numbered": return (<View>{b.items.map((it, i) => (<View key={i} style={styles.bullet}><Text style={{ width: 16 }}>{i + 1}.</Text><Text style={{ flex: 1 }}>{it}</Text></View>))}</View>);
    case "table": return (
      <View style={styles.table}>
        <View style={styles.tr}>{b.headers.map((h, i) => <Text key={i} style={styles.th}>{h}</Text>)}</View>
        {b.rows.map((r, i) => (<View key={i} style={styles.tr}>{r.map((c, j) => <Text key={j} style={styles.td}>{c}</Text>)}</View>))}
      </View>
    );
    case "divider": return <View style={styles.divider} />;
  }
}

function OutlineDocument({ outline, footer }: { outline: Outline; footer: string }) {
  return (
    <Document title={outline.title} author="LaunchKit VN" language="vi">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{outline.title}</Text>
        {outline.subtitle ? <Text style={styles.subtitle}>{outline.subtitle}</Text> : null}
        {outline.blocks.map((b, i) => <BlockView key={i} b={b} />)}
        <View style={styles.footer} fixed>
          <Text>{footer}</Text>
          <Text render={({ pageNumber, totalPages }) => `Trang ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/** Render outline thành PDF buffer. */
export async function renderOutlinePdf(outline: Outline, footer = "Tạo bởi LaunchKit VN"): Promise<Buffer> {
  ensureFonts();
  const buf = await renderToBuffer(<OutlineDocument outline={outline} footer={footer} />);
  return Buffer.from(buf);
}
