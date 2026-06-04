"use client";

import { createClient } from "@/lib/supabase";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

type HomeClientProps = {
  userId: string;
  userEmail?: string | null;
};

export default function HomeClient({ userId, userEmail }: HomeClientProps) {
  const [inputText, setInputText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoadingNotes(false);
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setGenerating(true);
    setExplanation("");
    setSaveMessage(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "解説の生成に失敗しました");
      }
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation(
        err instanceof Error ? err.message : "解説の生成に失敗しました"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveNote() {
    if (!explanation.trim() || !inputText.trim()) return;

    setSaving(true);
    setSaveMessage(null);
    const supabase = createClient();
    const title = inputText.trim().slice(0, 20);

    const { error } = await supabase.from("notes").insert({
      title,
      content: explanation,
      user_id: userId,
    });

    setSaving(false);
    if (error) {
      setSaveMessage("保存に失敗しました: " + error.message);
      return;
    }
    setSaveMessage("保存しました！");
    fetchNotes();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {userEmail && (
        <p className="mb-6 text-sm text-kyudo-700">
          ログイン中: <span className="font-medium">{userEmail}</span>
        </p>
      )}

      <section className="rounded-2xl border border-kyudo-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-kyudo-900">テキスト解説</h2>
        <p className="mt-1 text-sm text-kyudo-700">
          解説したいテキストを入力してください
        </p>
        <form onSubmit={handleGenerate} className="mt-4 space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="例: 量子もつれとは何か、わかりやすく説明して"
            className="w-full rounded-lg border border-kyudo-200 px-3 py-2 text-kyudo-900 outline-none focus:border-kyudo-600 focus:ring-2 focus:ring-kyudo-200"
          />
          <button
            type="submit"
            disabled={generating || !inputText.trim()}
            className="rounded-lg bg-kyudo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-kyudo-800 disabled:opacity-60"
          >
            {generating ? "解説を生成中..." : "解説を生成する"}
          </button>
        </form>

        {explanation && (
          <div className="mt-6 rounded-lg border border-kyudo-200 bg-kyudo-50 p-4">
            <h3 className="text-sm font-semibold text-kyudo-800">解説結果</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-kyudo-900">
              {explanation}
            </p>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={saving}
              className="mt-4 rounded-lg border border-kyudo-600 bg-white px-4 py-2 text-sm font-medium text-kyudo-800 transition hover:bg-kyudo-100 disabled:opacity-60"
            >
              {saving ? "保存中..." : "ノートに保存する"}
            </button>
            {saveMessage && (
              <p
                className={`mt-2 text-sm ${
                  saveMessage.includes("保存しました")
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-kyudo-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-kyudo-900">あなたのノート</h2>
        <p className="mt-1 text-sm text-kyudo-700">
          ログイン中のユーザーに紐づくノートのみ表示されます
        </p>

        {loadingNotes ? (
          <p className="mt-4 text-sm text-kyudo-600">読み込み中...</p>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-sm text-kyudo-600">
            まだノートがありません。解説を保存するとここに表示されます。
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-kyudo-200 bg-kyudo-50 p-4"
              >
                <p className="font-medium text-kyudo-900">{note.title}</p>
                <p className="mt-1 line-clamp-3 text-sm text-kyudo-700">
                  {note.content}
                </p>
                <p className="mt-2 text-xs text-kyudo-600">
                  {new Date(note.created_at).toLocaleString("ja-JP")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
