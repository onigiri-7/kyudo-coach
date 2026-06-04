import Header from "@/components/Header";
import NotesList from "@/components/NotesList";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <Header email={user.email} />
      <div className="border-b border-slate-100 bg-white/60">
        <div className="mx-auto max-w-3xl px-4 py-2">
          <a href="/" className="text-sm text-indigo-600 hover:underline">
            ← ホームに戻る
          </a>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <NotesList userId={user.id} />
      </main>
    </div>
  );
}
