# Supabase Auth セットアップ

## 1. Supabase ダッシュボード

### Authentication → Providers

- **Email**: 有効化（Confirm email は開発時 OFF でも可）
- **Google**: 有効化し、Google Cloud の Client ID / Secret を入力

### Authentication → URL Configuration

| 項目 | 値（ローカル） |
|------|----------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

本番デプロイ時は Vercel 等の URL も追加してください。

### Google Cloud Console

- OAuth クライアント（Web）
- 承認済みリダイレクト URI に Supabase のコールバック URL を追加  
  （Authentication → Providers → Google に表示される URL）

## 2. SQL（notes + RLS）

`supabase/migrations/001_notes_user_id.sql` を SQL Editor で実行します。

## 3. 環境変数

```powershell
Copy-Item .env.local.example .env.local
notepad .env.local
```

## 4. 起動

```powershell
npm install
npm run dev
```

（Cloud エージェントでは `npm run dev` は実行しません。ローカルで確認してください。）
