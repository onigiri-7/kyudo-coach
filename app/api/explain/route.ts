import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "テキストが空です" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system:
      "あなたはわかりやすく説明する解説者です。入力されたテキストについて、初心者にも伝わるように丁寧に解説してください。",
    messages: [
      {
        role: "user",
        content: text.trim(),
      },
    ],
  });

  const explanation =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ explanation });
}
