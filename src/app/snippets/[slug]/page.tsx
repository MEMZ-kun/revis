import snippets from "@/data/snippets.json";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return snippets.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snippet = snippets.find((s) => s.slug === slug);
  if (!snippet) return {};
  return {
    title: `${snippet.title} | Revis`,
    description: snippet.description,
  };
}

export default async function SnippetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snippet = snippets.find((s) => s.slug === slug);
  if (!snippet) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{snippet.title}</h1>
      <p className="text-gray-600 mb-8">{snippet.description}</p>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">パターン</h2>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-lg">
          /{snippet.pattern}/{snippet.flags}
        </div>
        <a href={`/?pattern=${encodeURIComponent(snippet.pattern)}&flags=${snippet.flags}&test=${encodeURIComponent(snippet.testString)}`}
          className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          → ビジュアライザーで開く
        </a>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">テスト例</h2>
        <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">{snippet.testString}</div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">コード例</h2>
        {Object.entries(snippet.codeExamples).map(([lang, code]) => (
          <div key={lang} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{lang}</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">{code}</pre>
          </div>
        ))}
      </section>
      <div className="flex gap-2 flex-wrap">
        {snippet.tags.map((tag) => (
          <span key={tag} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">{tag}</span>
        ))}
      </div>
    </main>
  );
}
