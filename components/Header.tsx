"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type HeaderProps = {
  email?: string | null;
};

export default function Header({ email }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold text-slate-800 transition hover:text-indigo-600"
        >
          大学講義解説アプリ
        </Link>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[200px] truncate text-sm text-kyudo-700 sm:inline">
              {email}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
