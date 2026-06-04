# Vercel デプロイ（lecture-app-virid.vercel.app）

## 方法 A: GitHub 連携（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard) で **lecture-app** プロジェクトを開く
2. **Settings → Git** でリポジトリを `onigiri-7/kyudo-coach` に接続（または Import）
3. **Settings → Environment Variables** に以下を追加（Production / Preview 両方）:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_MODEL`（任意）
4. `main` ブランチへ push すると自動デプロイされる
5. Supabase の Redirect URL に  
   `https://lecture-app-virid.vercel.app/auth/callback` を追加

## 方法 B: Vercel CLI

```powershell
npx vercel login
cd c:\claude-app
npx vercel link
# 既存プロジェクト lecture-app を選択
npx vercel --prod
```

環境変数は Vercel ダッシュボードで設定してください。
