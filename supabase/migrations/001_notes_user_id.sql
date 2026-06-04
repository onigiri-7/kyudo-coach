-- notes テーブルに user_id を追加し、ユーザーごとにノートを管理する
-- Supabase SQL Editor で実行してください

-- 既存テーブルに created_at が無い場合
alter table public.notes
  add column if not exists created_at timestamptz default now();

alter table public.notes
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists notes_user_id_idx on public.notes (user_id);

alter table public.notes enable row level security;

drop policy if exists "Users can view own notes" on public.notes;
create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on public.notes;
create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own notes" on public.notes;
create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);
