"use client";

import { useState, useCallback } from "react";

interface Match {
  value: string;
  index: number;
  end: number;
  groups: { [key: string]: string } | undefined;
}

const TOKEN_COLORS: Record<string, { bg: string; label: string }> = {
  class:   { bg: "#534AB7", label: "文字クラス []" },
  group:   { bg: "#BA7517", label: "グループ ()" },
  escape:  { bg: "#0F6E56", label: "エスケープ \\" },
  any:     { bg: "#D85A30", label: "任意 ." },
  anchor:  { bg: "#185FA5", label: "アンカー ^$" },
  or:      { bg: "#888780", label: "OR |" },
  literal: { bg: "#3C3489", label: "文字" },
};

const SAMPLES = [
  { label: "メールアドレス", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", flags: "g", test: "hello@example.com, test@foo.org" },
  { label: "ひらがな", pattern: "[\\u3041-\\u3096]+", flags: "g", test: "あいうえお、Hello、かきくけこ" },
  { label: "郵便番号", pattern: "\\d{3}-\\d{4}", flags: "g", test: "東京 150-0001、大阪 530-0001" },
];

function tokenize(pattern: string) {
  const nodes: { type: string; value: string }[] = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "[") {
      const end = pattern.indexOf("]", i);
      if (end === -1) { nodes.push({ type: "literal", value: ch }); i++; continue; }
      nodes.push({ type: "class", value: pattern.slice(i, end + 1) }); i = end + 1;
    } else if (ch === "(") {
      const end = pattern.indexOf(")", i);
      if (end === -1) { nodes.push({ type: "literal", value: ch }); i++; continue; }
      nodes.push({ type: "group", value: pattern.slice(i, end + 1) }); i = end + 1;
    } else if (ch === "\\") {
      nodes.push({ type: "escape", value: pattern.slice(i, i + 2) }); i += 2;
    } else if ("*+?{}".includes(ch)) {
      if (nodes.length > 0) nodes[nodes.length - 1].value += ch;
      i++;
    } else if (ch === ".") {
      nodes.push({ type: "any", value: "." }); i++;
    } else if (ch === "^" || ch === "$") {
      nodes.push({ type: "anchor", value: ch }); i++;
    } else if (ch === "|") {
      nodes.push({ type: "or", value: "|" }); i++;
    } else {
      const last = nodes[nodes.length - 1];
      if (last?.type === "literal") { last.value += ch; } else { nodes.push({ type: "literal", value: ch }); }
      i++;
    }
  }
  return nodes;
}

function RailroadDiagram({ pattern }: { pattern: string }) {
  if (!pattern) return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
      正規表現を入力すると鉄道図が表示されます
    </div>
  );
  const nodes = tokenize(pattern);
  return (
    <div>
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", padding: "12px 0" }}>
          <div style={{ width: 20, height: 2, background: "#d1d5db" }} />
          <div style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#9ca3af", letterSpacing: "0.05em" }}>START</div>
          <div style={{ width: 12, height: 2, background: "#d1d5db" }} />
          {nodes.map((node, i) => {
            const col = TOKEN_COLORS[node.type] ?? TOKEN_COLORS.literal;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ background: col.bg, borderRadius: 6, padding: "5px 10px", fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                  {node.value}
                </div>
                {i < nodes.length - 1 && <div style={{ width: 12, height: 2, background: "#d1d5db" }} />}
              </div>
            );
          })}
          <div style={{ width: 12, height: 2, background: "#d1d5db" }} />
          <div style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#9ca3af", letterSpacing: "0.05em" }}>END</div>
          <div style={{ width: 20, height: 2, background: "#d1d5db" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #f3f4f6" }}>
        {Object.entries(TOKEN_COLORS).map(([, v]) => (
          <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: v.bg, flexShrink: 0 }} />
            {v.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  const COLORS = ["#bfdbfe", "#bbf7d0", "#fef08a", "#fecaca", "#e9d5ff", "#fed7aa"];
  if (!matches.length) return (
    <span style={{ fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", color: "#374151" }}>{text}</span>
  );
  const parts: { text: string; isMatch: boolean; idx: number }[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), isMatch: false, idx: -1 });
    parts.push({ text: m.value, isMatch: true, idx: i });
    last = m.end;
  });
  if (last < text.length) parts.push({ text: text.slice(last), isMatch: false, idx: -1 });
  return (
    <span style={{ fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", color: "#374151" }}>
      {parts.map((p, i) =>
        p.isMatch
          ? <mark key={i} style={{ background: COLORS[p.idx % COLORS.length], borderRadius: 3, padding: "0 2px", color: "#111827" }}>{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </span>
  );
}

const CODE: Record<string, (p: string, f: string) => string> = {
  javascript: (p, f) => `const regex = /${p || "pattern"}/${f};\nconst matches = text.match(regex);`,
  python:     (p, f) => `import re\npattern = re.compile(r'${p || "pattern"}'${f.includes("i") ? ", re.IGNORECASE" : ""})\nmatches = pattern.findall(text)`,
  go:         (p)    => `import "regexp"\nre := regexp.MustCompile(\`${p || "pattern"}\`)\nmatches := re.FindAllString(text, -1)`,
};

export default function RegexVisualizer() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("今日はいい天気ですね。あいうえお\nHello World 123");
  const [flavor, setFlavor] = useState("javascript");
  const [tab, setTab] = useState<"diagram" | "matches">("diagram");
  const [copied, setCopied] = useState(false);

  const { matches, error } = useCallback((): { matches: Match[]; error: string | null } => {
    if (!pattern) return { matches: [], error: null };
    try {
      const matches: Match[] = [];
      if (flags.includes("g")) {
        const r = new RegExp(pattern, flags);
        let m;
        while ((m = r.exec(testStr)) !== null) {
          matches.push({ value: m[0], index: m.index, end: m.index + m[0].length, groups: m.groups });
          if (m[0].length === 0) r.lastIndex++;
        }
      } else {
        const m = new RegExp(pattern, flags).exec(testStr);
        if (m) matches.push({ value: m[0], index: m.index, end: m.index + m[0].length, groups: m.groups });
      }
      return { matches, error: null };
    } catch (e) { return { matches: [], error: (e as Error).message }; }
  }, [pattern, flags, testStr])();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?pattern=${encodeURIComponent(pattern)}&flags=${flags}&test=${encodeURIComponent(testStr)}`
    : "";

  const toggleFlag = (f: string) => setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── ヘッダー ── */}
      <header style={{
        background: "#ffffff", borderBottom: "1px solid #e5e7eb",
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#185FA5" }}>Revis</span>
          <span style={{ width: 1, height: 14, background: "#e5e7eb", display: "inline-block" }} />
          {pattern ? (
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>
              /{pattern}/{flags}
              {matches.length > 0 && (
                <span style={{ marginLeft: 8, color: "#166534", background: "#dcfce7", padding: "1px 8px", borderRadius: 10, fontSize: 11, fontFamily: "system-ui" }}>
                  {matches.length} match{matches.length > 1 ? "es" : ""}
                </span>
              )}
              {error && (
                <span style={{ marginLeft: 8, color: "#991b1b", background: "#fee2e2", padding: "1px 8px", borderRadius: 10, fontSize: 11, fontFamily: "system-ui" }}>
                  error
                </span>
              )}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>regex visualizer</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["javascript", "python", "go"].map(f => (
            <button key={f} onClick={() => setFlavor(f)} style={{
              fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
              border: `1px solid ${flavor === f ? "#185FA5" : "#e5e7eb"}`,
              background: flavor === f ? "#eff6ff" : "#ffffff",
              color: flavor === f ? "#185FA5" : "#6b7280",
            }}>{f}</button>
          ))}
          <span style={{ width: 1, height: 14, background: "#e5e7eb", display: "inline-block", margin: "0 4px" }} />
          <a href="/snippets" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>スニペット →</a>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>

        {/* ── 正規表現入力 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#ffffff",
            border: `2px solid ${error ? "#ef4444" : "#185FA5"}`,
            borderRadius: 10, padding: "10px 16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 22, color: "#9ca3af" }}>/</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="正規表現を入力..."
              style={{
                flex: 1, fontFamily: "monospace", fontSize: 18,
                border: "none", outline: "none", background: "transparent",
                color: error ? "#ef4444" : "#111827",
              }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 22, color: "#9ca3af" }}>/</span>
            <input
              value={flags}
              onChange={e => setFlags(e.target.value)}
              style={{ width: 52, fontFamily: "monospace", fontSize: 18, border: "none", outline: "none", background: "transparent", color: "#185FA5" }}
            />
          </div>
          {error && (
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6, paddingLeft: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span>⚠</span> {error}
            </div>
          )}
          {/* フラグ */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 2 }}>flags</span>
            {["g", "i", "m", "s"].map(fl => (
              <button key={fl} onClick={() => toggleFlag(fl)} style={{
                padding: "3px 12px", borderRadius: 20, fontSize: 12,
                fontFamily: "monospace", cursor: "pointer",
                border: `1px solid ${flags.includes(fl) ? "#185FA5" : "#e5e7eb"}`,
                background: flags.includes(fl) ? "#eff6ff" : "#ffffff",
                color: flags.includes(fl) ? "#185FA5" : "#9ca3af",
              }}>{fl}</button>
            ))}
          </div>
        </div>

        {/* ── サンプル（未入力時のみ） ── */}
        {!pattern && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>サンプルを試す</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SAMPLES.map(s => (
                <button key={s.label} onClick={() => { setPattern(s.pattern); setFlags(s.flags); setTestStr(s.test); }} style={{
                  fontSize: 12, padding: "6px 14px", borderRadius: 7, cursor: "pointer",
                  border: "1px solid #e5e7eb", background: "#ffffff", color: "#374151",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}>{s.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── テスト文字列 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>テスト文字列</div>
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", minHeight: 52, lineHeight: 2, background: "#fafafa" }}>
              <HighlightedText text={testStr} matches={matches} />
            </div>
            <textarea
              value={testStr}
              onChange={e => setTestStr(e.target.value)}
              rows={3}
              style={{
                width: "100%", fontFamily: "monospace", fontSize: 13,
                border: "none", outline: "none", padding: "10px 16px",
                background: "#ffffff", color: "#374151",
                resize: "vertical", boxSizing: "border-box", display: "block",
              }}
              placeholder="テスト文字列を入力..."
            />
          </div>
        </div>

        {/* ── 鉄道図 / マッチ結果 ── */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 24, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
            {(["diagram", "matches"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "11px 0", fontSize: 12, cursor: "pointer",
                border: "none", background: "transparent",
                borderBottom: `2px solid ${tab === t ? "#185FA5" : "transparent"}`,
                color: tab === t ? "#185FA5" : "#9ca3af",
                fontWeight: tab === t ? 600 : 400,
              }}>
                {t === "diagram" ? "鉄道図" : `マッチ結果${matches.length > 0 ? ` (${matches.length})` : ""}`}
              </button>
            ))}
          </div>
          <div style={{ padding: "16px" }}>
            {tab === "diagram" && <RailroadDiagram pattern={pattern} />}
            {tab === "matches" && (
              matches.length === 0
                ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>マッチなし</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {matches.map((m, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 12, alignItems: "center",
                        background: "#f9fafb", borderRadius: 6, padding: "8px 12px",
                        fontFamily: "monospace", fontSize: 12,
                      }}>
                        <span style={{ color: "#9ca3af", minWidth: 24 }}>#{i + 1}</span>
                        <span style={{ color: "#185FA5", fontWeight: 600 }}>"{m.value}"</span>
                        <span style={{ color: "#9ca3af", marginLeft: "auto" }}>{m.index}–{m.end}</span>
                        {m.groups && <span style={{ color: "#166534" }}>{JSON.stringify(m.groups)}</span>}
                      </div>
                    ))}
                  </div>
            )}
          </div>
        </div>

        {/* ── コード例 ── */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 24, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>コード例 — {flavor}</span>
          </div>
          <pre style={{ margin: 0, padding: "14px 16px", fontFamily: "monospace", fontSize: 12, background: "#1e1e2e", color: "#cdd6f4", overflowX: "auto", lineHeight: 1.8 }}>
            {CODE[flavor](pattern, flags)}
          </pre>
        </div>

        {/* ── 共有 ── */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>URLで共有</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={shareUrl} style={{
              flex: 1, fontSize: 11, fontFamily: "monospace",
              border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px",
              background: "#f9fafb", color: "#9ca3af", outline: "none",
            }} />
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: `1px solid ${copied ? "#16a34a" : "#e5e7eb"}`,
              background: copied ? "#f0fdf4" : "#ffffff",
              color: copied ? "#166534" : "#374151",
              whiteSpace: "nowrap",
            }}>
              {copied ? "コピー済み ✓" : "コピー"}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid #f3f4f6", marginTop: 8 }}>
            <a href="/privacy" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>プライバシーポリシー</a>
        </div>
      </div>
    </div>
  );
}