"""
弓道の練習内容を入力すると、AIコーチが改善アドバイスを返すツール。
使い方: python chat.py
終了: exit / quit / q または Ctrl+C
"""

import os
import sys

from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    print("エラー: .env に ANTHROPIC_API_KEY を設定してください。")
    print("  1. .env.example をコピーして .env を作成")
    print("  2. https://console.anthropic.com/ で API キーを取得し、.env に貼り付け")
    sys.exit(1)

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
client = Anthropic(api_key=API_KEY)

SYSTEM_PROMPT = """あなたは弓道の専門コーチです。

弓道家が練習内容を報告したら、以下を意識してアドバイスしてください。
- 報告内容を具体的に分析する
- 改善点を明確に指摘する
- 次回の練習で試せるドリルや意識のポイントを提案する
- 射法八節・正座・打起・会・仕など、弓道の用語を適切に使う
- 励ましつつ、専門家として誠実にフィードバックする

回答は見やすく、箇条書きを活用してください。"""

messages: list[dict[str, str]] = []


def get_advice(practice_report: str) -> str:
    messages.append({"role": "user", "content": practice_report})
    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    reply = response.content[0].text
    messages.append({"role": "assistant", "content": reply})
    return reply


def main() -> None:
    print("弓道 練習アドバイスター")
    print("練習内容を入力すると、コーチが改善アドバイスを返します。")
    print("終了: exit / quit / q\n")
    print("入力例:")
    print("  今日は立射20本。会のタイミングが遅く、矢が低めに抜けた。")
    print("  座射で正座の膝が浮きやすい。打起は安定していた。\n")

    while True:
        try:
            practice_report = input("練習内容: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n終了します。")
            break

        if not practice_report:
            continue
        if practice_report.lower() in ("exit", "quit", "q"):
            print("終了します。")
            break

        try:
            advice = get_advice(practice_report)
            print(f"\nコーチ:\n{advice}\n")
        except Exception as e:
            print(f"\nエラー: {e}\n")


if __name__ == "__main__":
    main()
