import snippets from "@/data/snippets.json";
import Link from "next/link";

export const metadata = {
  title: "正規表現スニペット集 | Revis",
  description: "日本語・英語対応の正規表現スニペット集。ひらがな・カタカナ・郵便番号・電話番号・メールアドレスなど。",
};

export default function SnippetsPage() {
  const jaSnippets = snippets.filter((s) => s.lang === "ja");
  const enSnippets = snippets.filter((s) => s.lang === "en");
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">正規表現スニペット集</h1>
      <p className="text-gray-600 mb-10">すぐに使える正規表現パターン集。日本語・英語対応。</p>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">🇯🇵 日本語</h2>
        <div className="grid gap-3">
          {jaSnippets.map((s) => (
            <Link key={s.slug} href={`/snippets/${s.slug}`} className="block border rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition">
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-gray-500 mt-1">{s.description}</div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">🌐 English</h2>
        <div className="grid gap-3">
          {enSnippets.map((s) => (
            <Link key={s.slug} href={`/snippets/${s.slug}`} className="block border rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition">
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-gray-500 mt-1">{s.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
