import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ用 Supabase クライアント（Client Components から利用）
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください。"
    );
  }

  return createBrowserClient(url, key);
}
