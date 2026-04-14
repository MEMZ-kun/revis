import RegexVisualizer from "@/components/RegexVisualizer";

export const metadata = {
  title: "Revis - 正規表現ビジュアライザー",
  description: "正規表現をリアルタイムでビジュアライズ。日本語対応・完全ブラウザ処理・URLシェア機能付き。",
};

export default function Home() {
  return <RegexVisualizer />;
}