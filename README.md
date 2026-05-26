# Claude 会話スクリプト（Python）

Anthropic API を使って、ターミナル上で Claude と会話する最小構成のサンプルです。

## 必要なもの

- Python 3.10 以上
- [Anthropic](https://console.anthropic.com/) の API キー

## セットアップ

### 1. 仮想環境を作る（推奨）

```powershell
cd c:\claude-app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS / Linux の場合:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. ライブラリをインストール

```powershell
pip install -r requirements.txt
```

インストールされる主なパッケージ:

| パッケージ | 役割 |
|-----------|------|
| `anthropic` | Anthropic 公式 SDK |
| `python-dotenv` | `.env` から環境変数を読み込む |

個別に入れる場合:

```powershell
pip install anthropic python-dotenv
```

### 3. API キーを設定

`.env.example` をコピーして `.env` を作成し、API キーを書きます。

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
notepad .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

`.env` の例:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

任意でモデルを変える場合:

```
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

> **注意:** `.env` は Git にコミットしないでください（`.gitignore` に含めています）。

## 使い方

```powershell
python chat.py
```

会話例:

```
あなた: こんにちは
Claude: こんにちは！...

あなた: exit
終了します。
```

終了コマンド: `exit` / `quit` / `q`、または `Ctrl+C`

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `ANTHROPIC_API_KEY を設定してください` | `.env` が同じフォルダにあるか、キー名が正しいか確認 |
| `ModuleNotFoundError: anthropic` | 仮想環境を有効化したうえで `pip install -r requirements.txt` |
| 認証エラー | API キーのコピーミス、期限切れ、残高不足を確認 |

## ファイル構成

```
claude-app/
├── chat.py           # メインスクリプト
├── requirements.txt  # 依存ライブラリ
├── .env.example      # 環境変数のテンプレート
├── .env              # 自分用（要作成・Git 非推奨）
└── README.md
```
