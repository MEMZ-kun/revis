export const metadata = {
  title: "プライバシーポリシー | Revis",
  description: "Revisのプライバシーポリシーページです。",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px", fontFamily: "system-ui, sans-serif", lineHeight: 1.8, color: "#374151", background: "#ffffff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32, color: "#111827" }}>プライバシーポリシー</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111827" }}>1. 基本方針</h2>
        <p>Revis（revis.memzlab.com）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本サービスは正規表現のビジュアライズツールであり、入力されたすべてのデータはブラウザ内でのみ処理され、サーバーに送信されることはありません。</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111827" }}>2. 収集する情報</h2>
        <p>本サービスでは以下の情報を収集する場合があります：</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
          <li>Google Analyticsによるアクセス解析データ</li>
          <li>Google AdSenseによる広告配信のためのCookieデータ</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111827" }}>3. Cookieについて</h2>
        <p>本サービスはGoogle AdSenseを使用しており、第三者がCookieを使用して広告を配信する場合があります。Cookieを無効にする場合はブラウザの設定から変更できます。</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111827" }}>4. 入力データについて</h2>
        <p>正規表現パターンやテスト文字列など、ビジュアライザーに入力されたデータはすべてブラウザ内で処理されます。これらのデータが外部サーバーに送信されることは一切ありません。</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111827" }}>5. お問い合わせ</h2>
        <p>プライバシーポリシーに関するご質問は、サイト運営者までお問い合わせください。</p>
      </section>

      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 48 }}>最終更新日：2025年4月</p>

      <div style={{ marginTop: 32 }}>
        <a href="/" style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>← トップに戻る</a>
      </div>
    </main>
  );
}
