# 弓道 練習アドバイスター

Anthropic API と Streamlit を使った、弓道の練習アドバイス Web アプリです。Google ログイン後、ユーザーごとに練習記録が分かれて保存されます。

## 必要なもの

- Python 3.10 以上
- [Anthropic](https://console.anthropic.com/) の API キー
- [Google Cloud](https://console.cloud.google.com/) の OAuth クライアント ID

## セットアップ

### 1. 仮想環境とライブラリ

```powershell
cd c:\claude-app
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Google ログインの設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **APIとサービス** → **認証情報** → **認証情報を作成** → **OAuth クライアント ID**
3. アプリケーションの種類: **ウェブアプリケーション**
4. **承認済みのリダイレクト URI** に以下を追加:
   ```
   http://localhost:8501/oauth2callback
   ```
5. 表示された **クライアント ID** と **クライアント シークレット** を控える

### 3. 環境変数を設定

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env` の例:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-5

GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
COOKIE_SECRET=ランダムな長い文字列
REDIRECT_URI=http://localhost:8501/oauth2callback
```

`COOKIE_SECRET` は次のコマンドで生成できます:

```powershell
py -c "import secrets; print(secrets.token_hex(32))"
```

**別の方法:** `.streamlit/secrets.toml.example` を `secrets.toml` にコピーして同じ値を設定しても動作します。

### 4. 起動

```powershell
streamlit run chat.py
```

1. ブラウザで http://localhost:8501 を開く
2. **Googleでログイン** をクリック
3. 練習内容を入力してアドバイスを取得

## 機能

- **Googleログイン** — Streamlit 組み込みの OIDC 認証（`st.login`）
- **ユーザー別の記録** — `records/<ユーザーID>/` に保存（他ユーザーからは見えない）
- **コーチに相談** — 練習内容から改善アドバイスを取得
- **練習記録** — 自分の過去記録を振り返り

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| Googleログインの設定がありません | `.env` の Google 関連3項目を確認 |
| リダイレクト URI エラー | Google Cloud の URI と `REDIRECT_URI` が一致しているか確認 |
| APIキーが設定されていません | `ANTHROPIC_API_KEY` を `.env` に設定 |
| ログイン後すぐ戻る | `COOKIE_SECRET` が空でないか確認 |

## ファイル構成

```
claude-app/
├── chat.py
├── requirements.txt
├── .env.example
├── .streamlit/
│   └── secrets.toml.example
├── records/              # ユーザーごとの練習記録
│   └── <GoogleユーザーID>/
└── README.md
```
