"use client";

import { createClient } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

type NotesListProps = {
  userId: string;
};

export default function NotesList({ userId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">📒 ノート一覧</h2>
      <p className="mt-1 text-sm text-slate-600">
        ログイン中のユーザーに紐づくノートのみ表示されます
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">読み込み中...</p>
      ) : notes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          まだノートがありません。
          <a href="/text" className="text-indigo-600 underline">
            テキスト解説
          </a>
          から保存できます。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-medium text-slate-900">{note.title}</p>
              <p className="mt-1 line-clamp-4 text-sm text-slate-700 whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(note.created_at).toLocaleString("ja-JP")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
