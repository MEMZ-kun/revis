"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface Match {
  value: string;
  index: number;
  end: number;
  groups: { [key: string]: string } | undefined;
}

function getRailroadNodes(pattern: string) {
  const nodes: { type: string; value: string; color: string }[] = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "[") {
      const end = pattern.indexOf("]", i);
      const value = pattern.slice(i, end + 1);
      nodes.push({ type: "class", value, color: "#6366f1" });
      i = end + 1;
    } else if (ch === "(" ) {
      const end = pattern.indexOf(")", i);
      const value = pattern.slice(i, end + 1);
      nodes.push({ type: "group", value, color: "#f59e0b" });
      i = end + 1;
    } else if (ch === "\\") {
      const value = pattern.slice(i, i + 2);
      nodes.push({ type: "escape", value, color: "#10b981" });
      i += 2;
    } else if ("*+?{}".includes(ch)) {
      if (nodes.length > 0) {
        nodes[nodes.length - 1].value += ch;
      }
      i++;
    } else if (ch === ".") {
      nodes.push({ type: "any", value: ".", color: "#ef4444" });
      i++;
    } else if (ch === "^" || ch === "$") {
      nodes.push({ type: "anchor", value: ch, color: "#8b5cf6" });
      i++;
    } else if (ch === "|") {
      nodes.push({ type: "or", value: "|", color: "#64748b" });
      i++;
    } else {
      nodes.push({ type: "literal", value: ch, color: "#0ea5e9" });
      i++;
    }
  }
  return nodes;
}

function RailroadDiagram({ pattern }: { pattern: string }) {
  if (!pattern) return null;
  const nodes = getRailroadNodes(pattern);

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex items-center gap-0 min-w-max">
        <div className="w-8 h-0.5 bg-gray-400" />
        <div className="flex items-center border-2 border-gray-300 rounded px-2 py-1 text-xs text-gray-500">START</div>
        <div className="w-4 h-0.5 bg-gray-400" />
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center">
            <div
              className="border-2 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white min-w-[2rem] text-center"
              style={{ backgroundColor: node.color, borderColor: node.color }}
              title={node.type}
            >
              {node.value}
            </div>
            {i < nodes.length - 1 && <div className="w-4 h-0.5 bg-gray-400" />}
          </div>
        ))}
        <div className="w-4 h-0.5 bg-gray-400" />
        <div className="flex items-center border-2 border-gray-300 rounded px-2 py-1 text-xs text-gray-500">END</div>
        <div className="w-8 h-0.5 bg-gray-400" />
      </div>
      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          { color: "#0ea5e9", label: "文字" },
          { color: "#6366f1", label: "文字クラス []" },
          { color: "#10b981", label: "エスケープ \\" },
          { color: "#f59e0b", label: "グループ ()" },
          { color: "#ef4444", label: "任意 ." },
          { color: "#8b5cf6", label: "アンカー ^$" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (matches.length === 0) return <span>{text}</span>;

  const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isMatch: false, matchIndex: -1 });
    }
    parts.push({ text: match.value, isMatch: true, matchIndex: i });
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isMatch: false, matchIndex: -1 });
  }

  const colors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];

  return (
    <>
      {parts.map((part, i) =>
        part.isMatch ? (
          <mark
            key={i}
            style={{ backgroundColor: colors[part.matchIndex % colors.length] }}
            className="rounded px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

export default function RegexVisualizer() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("テキストを入力してください。\nHello World 123");
  const [flavor, setFlavor] = useState("javascript");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagram" | "matches">("diagram");

  const getMatches = useCallback((): { matches: Match[]; error: string | null } => {
    if (!pattern) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flags);
      const matches: Match[] = [];
      if (flags.includes("g")) {
        let m;
        const r = new RegExp(pattern, flags);
        while ((m = r.exec(testString)) !== null) {
          matches.push({ value: m[0], index: m.index, end: m.index + m[0].length, groups: m.groups });
          if (m[0].length === 0) r.lastIndex++;
        }
      } else {
        const m = regex.exec(testString);
        if (m) matches.push({ value: m[0], index: m.index, end: m.index + m[0].length, groups: m.groups });
      }
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  const { matches, error } = getMatches();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?pattern=${encodeURIComponent(pattern)}&flags=${flags}&test=${encodeURIComponent(testString)}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, string> = {
    javascript: `const regex = /${pattern || "your-pattern"}/${flags};\nconst matches = text.match(regex);`,
    python: `import re\npattern = re.compile(r'${pattern || "your-pattern"}'${flags.includes("i") ? ", re.IGNORECASE" : ""})\nmatches = pattern.findall(text)`,
    go: `import "regexp"\nre := regexp.MustCompile(\`${pattern || "your-pattern"}\`)\nmatches := re.FindAllString(text, -1)`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">Revis</span>
          <span className="text-sm text-gray-400">Regex Visualizer</span>
        </div>
        <a href="/snippets" className="text-sm text-blue-600 hover:underline">スニペット集 →</a>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* 正規表現入力 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 font-mono text-xl">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="正規表現を入力..."
              className={`flex-1 font-mono text-lg outline-none ${error ? "text-red-500" : "text-gray-900"}`}
            />
            <span className="text-gray-400 font-mono text-xl">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-16 font-mono text-lg outline-none text-blue-600"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">⚠ {error}</p>}

          {/* フレーバー・フラグ */}
          <div className="flex gap-4 mt-3 flex-wrap">
            <div className="flex gap-1">
              {["javascript", "python", "go"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFlavor(f)}
                  className={`px-3 py-1 rounded text-sm ${flavor === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {["g", "i", "m", "s"].map((flag) => (
                <button
                  key={flag}
                  onClick={() => setFlags(prev => prev.includes(flag) ? prev.replace(flag, "") : prev + flag)}
                  className={`px-3 py-1 rounded text-sm font-mono ${flags.includes(flag) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* テスト文字列 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">テスト文字列</h2>
            <span className="text-sm text-gray-400">{matches.length} マッチ</span>
          </div>
          <div className="font-mono text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed mb-2">
            <HighlightedText text={testString} matches={matches} />
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={4}
            className="w-full font-mono text-sm border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-400"
            placeholder="テスト文字列を入力..."
          />
        </div>

        {/* タブ：鉄道図 / マッチ結果 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex gap-2 mb-4">
            {(["diagram", "matches"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded text-sm font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {tab === "diagram" ? "🔵 鉄道図" : "✅ マッチ結果"}
              </button>
            ))}
          </div>

          {activeTab === "diagram" && <RailroadDiagram pattern={pattern} />}

          {activeTab === "matches" && (
            <div>
              {matches.length === 0 ? (
                <p className="text-gray-400 text-sm">マッチなし</p>
              ) : (
                <div className="space-y-2">
                  {matches.map((m, i) => (
                    <div key={i} className="flex gap-4 bg-gray-50 rounded-lg p-3 font-mono text-sm">
                      <span className="text-gray-400">#{i + 1}</span>
                      <span className="text-blue-600 font-bold">"{m.value}"</span>
                      <span className="text-gray-400">index: {m.index}–{m.end}</span>
                      {m.groups && <span className="text-green-600">groups: {JSON.stringify(m.groups)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* コードスニペット */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-2">コード例（{flavor}）</h2>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
            {codeSnippets[flavor]}
          </pre>
        </div>

        {/* 共有 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-2">共有</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-mono"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}