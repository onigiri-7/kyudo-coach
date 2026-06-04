"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage(
        "確認メールを送信しました。メール内のリンクから登録を完了してください。"
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const next = searchParams.get("next") || "/";
    router.push(next.startsWith("/") ? next : "/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-4xl">🎯</p>
        <h1 className="mt-2 text-2xl font-bold text-kyudo-900">
          テキスト解説ノート
        </h1>
        <p className="mt-2 text-sm text-kyudo-700">
          ログインして、あなた専用のノートを管理しましょう
        </p>
      </div>

      <div className="rounded-2xl border border-kyudo-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex rounded-lg bg-kyudo-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-kyudo-900 shadow-sm"
                : "text-kyudo-700 hover:text-kyudo-900"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white text-kyudo-900 shadow-sm"
                : "text-kyudo-700 hover:text-kyudo-900"
            }`}
          >
            新規登録
          </button>
        </div>

        {authError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            認証に失敗しました。もう一度お試しください。
          </p>
        )}
        {message && (
          <p
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              message.includes("確認メール")
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-kyudo-800"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-kyudo-200 px-3 py-2 text-kyudo-900 outline-none focus:border-kyudo-600 focus:ring-2 focus:ring-kyudo-200"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-kyudo-800"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-kyudo-200 px-3 py-2 text-kyudo-900 outline-none focus:border-kyudo-600 focus:ring-2 focus:ring-kyudo-200"
              placeholder="6文字以上"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-kyudo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-kyudo-800 disabled:opacity-60"
          >
            {loading
              ? "処理中..."
              : mode === "login"
                ? "ログイン"
                : "新規登録"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-kyudo-200" />
          <span className="text-xs text-kyudo-600">または</span>
          <div className="h-px flex-1 bg-kyudo-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-kyudo-200 bg-white py-2.5 text-sm font-medium text-kyudo-800 transition hover:border-kyudo-600 hover:bg-kyudo-50 disabled:opacity-60"
        >
          <GoogleIcon />
          Googleでログイン
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-kyudo-600">
        <Link href="/" className="underline hover:text-kyudo-800">
          トップへ戻る
        </Link>
      </p>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
