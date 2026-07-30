import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    emoji: "🎯",
    title: "噛み合わない会議をなくす",
    description:
      "質問と回答がちゃんと噛み合っているかをAIが意味的にスコア判定。話がズレたその場でファシリテーターに警告を出します。",
  },
  {
    emoji: "🧩",
    title: "要領を得ない発言を要約",
    description:
      "冗長で回りくどい発言も、AIが論点を簡潔に整理してノードに表示。元の発言はホバーでいつでも確認できます。",
  },
  {
    emoji: "🕸️",
    title: "マインドマップで自動可視化",
    description:
      "質問を中心ノードに、回答を枝分かれで自動配置。手動でのドラッグ・編集もでき、リロードしても内容は保持されます。",
  },
  {
    emoji: "📁",
    title: "録画・録音データをアップロードするだけ",
    description:
      "会議の録画・録音ファイルをアップロードするだけで、AIが全体を文字起こしして解析します。特別なアプリや会議参加は不要です。",
  },
] as const;

const STEPS = [
  { step: "1", title: "録画データをアップロード", description: "会議の録画・録音ファイルを選んで「解析する」を押すだけ" },
  { step: "2", title: "自動でノード生成", description: "質問と回答が自動でマインドマップに追加されていく" },
  { step: "3", title: "ズレ・対立に気づく", description: "噛み合わない回答や、回答同士の対立が一目でわかる" },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <header className="flex items-center px-6 py-4 sm:px-10">
        <span className="text-sm font-semibold tracking-tight">会議ホワイトボード議事録</span>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-20 pt-16 text-center sm:pt-24">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            会議の&ldquo;聞きたいこと&rdquo;と&ldquo;答え&rdquo;を可視化する
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            話しているだけで、議論のズレが見えるホワイトボード
          </h1>
          <p className="max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            会議の録画・録音データをアップロードするだけで、質問と回答をマインドマップ化。噛み合っているかをAIが判定し、要領を得ない発言も簡潔に整理して見せます。
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/board"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
            >
              今すぐボードを開く →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-2xl dark:border-gray-800">
            <Image
              src="/screenshots/board-overview.png"
              alt="質問ノードと回答ノードがマインドマップ状に配置され、噛み合っていない回答には警告が表示されている実際の画面"
              width={2560}
              height={1514}
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="w-full"
              priority
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
              >
                <div className="mb-3 text-2xl">{f.emoji}</div>
                <h2 className="mb-1 text-sm font-semibold">{f.title}</h2>
                <p className="text-xs leading-6 text-gray-600 dark:text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50 px-6 py-16 dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-xl font-bold">使い方はシンプル</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs leading-6 text-gray-600 dark:text-gray-400">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="mb-3 text-xl font-bold">データはあなたのブラウザだけに保存されます</h2>
          <p className="mx-auto max-w-xl text-xs leading-6 text-gray-600 dark:text-gray-400">
            会議内容はローカルストレージに保存されるだけで、外部のデータベースには送信されません（AIによる解析リクエストを除く）。安心して社内の議論にお使いください。
          </p>
          <Link
            href="/board"
            className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
          >
            無料でボードを開く →
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400 dark:border-gray-800">
        会議ホワイトボード議事録 — 質問と回答の噛み合いを、その場で見える化する
      </footer>
    </div>
  );
}
