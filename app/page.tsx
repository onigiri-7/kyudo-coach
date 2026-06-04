import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

const features = [
  { href: "#", label: "🎙️録音・文字起こし", soon: true },
  { href: "/notes", label: "📒ノート一覧" },
  { href: "/text", label: "📝テキスト解説" },
  { href: "#", label: "📄PDF解説", soon: true },
  { href: "#", label: "📷カメラ解説", soon: true },
  { href: "#", label: "🔗URLから解説", soon: true },
  { href: "#", label: "📚単語帳・問題集", soon: true },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <p className="text-sm font-medium text-slate-600">大学講義解説アプリ</p>
          {user ? (
            <span className="text-sm text-slate-600">{user.email}</span>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              ログイン
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          大学講義解説アプリ
        </h1>
        <p className="mt-4 text-lg text-slate-600">講義をもっとわかりやすく</p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {features.map((item) =>
            item.soon ? (
              <span
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-slate-400"
              >
                {item.label}
                <span className="mt-1 block text-xs">準備中</span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-800 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {!user && (
          <p className="mt-10 text-sm text-slate-500">
            ノートやテキスト解説を使うには{" "}
            <Link href="/login" className="font-medium text-indigo-600 underline">
              ログイン
            </Link>{" "}
            が必要です
          </p>
        )}
      </main>
    </div>
  );
}
