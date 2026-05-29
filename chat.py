"""
弓道の練習アドバイス Web アプリ（Streamlit）
起動: streamlit run chat.py
"""

import os
from datetime import datetime
from pathlib import Path

import streamlit as st
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
RECORDS_DIR = Path(__file__).parent / "records"
DEFAULT_REDIRECT_URI = "http://localhost:8501/oauth2callback"

SYSTEM_PROMPT = """あなたは弓道の専門コーチです。

弓道家が練習内容を報告したら、以下を意識してアドバイスしてください。
- 報告内容を具体的に分析する
- 改善点を明確に指摘する
- 次回の練習で試せるドリルや意識のポイントを提案する
- 射法八節・正座・打起・会・仕など、弓道の用語を適切に使う
- 励ましつつ、専門家として誠実にフィードバックする

回答は見やすく、箇条書きを活用してください。"""


def configure_auth_from_env() -> bool:
    """secrets.toml が無い場合、.env から Google 認証設定を読み込む。"""
    try:
        if st.secrets.get("auth"):
            return True
    except Exception:
        pass

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    cookie_secret = os.getenv("COOKIE_SECRET")
    if not all([client_id, client_secret, cookie_secret]):
        return False

    from streamlit.runtime.secrets import secrets_singleton

    secrets_singleton._secrets = {
        "auth": {
            "redirect_uri": os.getenv("REDIRECT_URI", DEFAULT_REDIRECT_URI),
            "cookie_secret": cookie_secret,
            "google": {
                "client_id": client_id,
                "client_secret": client_secret,
                "server_metadata_url": (
                    "https://accounts.google.com/.well-known/openid-configuration"
                ),
            },
        }
    }
    return True


def auth_is_configured() -> bool:
    configure_auth_from_env()
    try:
        auth = st.secrets["auth"]
        google = auth.get("google", {})
        return bool(
            auth.get("redirect_uri")
            and auth.get("cookie_secret")
            and (google.get("client_id") or auth.get("client_id"))
            and (google.get("client_secret") or auth.get("client_secret"))
        )
    except Exception:
        return False


def get_user_id() -> str:
    return st.user.sub or st.user.email or "anonymous"


def get_user_records_dir() -> Path:
    user_dir = RECORDS_DIR / get_user_id()
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def save_record(practice: str, advice: str) -> Path:
    timestamp = datetime.now()
    filename = timestamp.strftime("%Y%m%d_%H%M%S") + ".txt"
    path = get_user_records_dir() / filename
    content = (
        f"日時: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"ユーザー: {st.user.name or st.user.email}\n"
        f"{'=' * 40}\n"
        f"【練習内容】\n{practice}\n\n"
        f"{'=' * 40}\n"
        f"【コーチのアドバイス】\n{advice}\n"
    )
    path.write_text(content, encoding="utf-8")
    return path


def list_record_files() -> list[Path]:
    return sorted(get_user_records_dir().glob("*.txt"), reverse=True)


def record_label(path: Path, index: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    date_line = lines[0] if lines else path.name
    return f"{index}. {date_line} ({path.name})"


def get_advice(practice_report: str) -> str:
    st.session_state.messages.append({"role": "user", "content": practice_report})
    client = Anthropic(api_key=API_KEY)
    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=st.session_state.messages,
    )
    reply = response.content[0].text
    st.session_state.messages.append({"role": "assistant", "content": reply})
    return reply


def init_session_state() -> None:
    if "messages" not in st.session_state:
        st.session_state.messages = []


def sync_user_session() -> None:
    """ログインユーザーが変わったら会話履歴をリセットする。"""
    user_id = get_user_id()
    if st.session_state.get("current_user_id") != user_id:
        st.session_state.messages = []
        st.session_state.current_user_id = user_id


def render_login_page() -> None:
    st.title("🎯 弓道 練習アドバイスター")
    st.markdown(
        "Googleアカウントでログインすると、あなた専用の練習記録を保存・振り返りできます。"
    )
    st.info("ログイン後、練習内容を入力して AI コーチからアドバイスを受けられます。")

    if st.button("Googleでログイン", type="primary", use_container_width=True):
        st.login("google")
        st.rerun()


def render_advice_tab() -> None:
    st.subheader("練習内容を入力")
    st.caption("立射・座射の本数、気づいたこと、課題などを自由に書いてください。")

    practice = st.text_area(
        "練習内容",
        height=150,
        placeholder="例: 今日は立射20本。会のタイミングが遅く、矢が低めに抜けた。",
        label_visibility="collapsed",
    )

    col1, col2 = st.columns(2)
    with col1:
        submit = st.button("アドバイスをもらう", type="primary", use_container_width=True)
    with col2:
        if st.button("会話をリセット", use_container_width=True):
            st.session_state.messages = []
            st.rerun()

    if submit:
        if not practice.strip():
            st.warning("練習内容を入力してください。")
            return

        with st.spinner("コーチがアドバイスを考えています..."):
            try:
                advice = get_advice(practice.strip())
                saved_path = save_record(practice.strip(), advice)
            except Exception as e:
                st.error(f"エラーが発生しました: {e}")
                return

        st.success(f"記録を保存しました: {saved_path.name}")
        st.markdown("### コーチのアドバイス")
        st.markdown(advice)


def render_history_tab() -> None:
    files = list_record_files()

    if not files:
        st.info("まだ練習記録がありません。「コーチに相談」タブでアドバイスをもらうと、ここに表示されます。")
        return

    st.caption(f"あなたの記録: 全 {len(files)} 件（新しい順）")
    labels = [record_label(f, i) for i, f in enumerate(files, start=1)]
    selected_label = st.selectbox("記録を選択", labels)

    index = labels.index(selected_label)
    content = files[index].read_text(encoding="utf-8")
    st.text_area("記録の詳細", value=content, height=400, disabled=True)


def main() -> None:
    st.set_page_config(
        page_title="弓道 練習アドバイスター",
        page_icon="🎯",
        layout="wide",
    )

    if not auth_is_configured():
        st.error(
            "Googleログインの設定がありません。\n\n"
            "`.env` に `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `COOKIE_SECRET` を設定するか、"
            "`.streamlit/secrets.toml` を作成してください（`.streamlit/secrets.toml.example` を参照）。"
        )
        st.stop()

    if not st.user.is_logged_in:
        render_login_page()
        st.stop()

    init_session_state()
    sync_user_session()

    st.title("🎯 弓道 練習アドバイスター")
    st.markdown(
        "練習内容を入力すると、AIコーチが具体的な改善アドバイスを返します。"
        "記録はあなたのアカウントに紐づけて自動保存されます。"
    )

    if not API_KEY:
        st.error(
            "APIキーが設定されていません。`.env` に `ANTHROPIC_API_KEY` を設定してから、"
            "アプリを再起動してください。"
        )
        st.stop()

    with st.sidebar:
        st.header("アカウント")
        st.write(st.user.name or "ユーザー")
        st.caption(st.user.email)
        if st.button("ログアウト", use_container_width=True):
            st.logout()
            st.session_state.messages = []
            st.session_state.pop("current_user_id", None)
            st.rerun()

        st.divider()
        st.header("設定")
        st.text(f"モデル: {MODEL}")
        st.text(f"あなたの記録: {len(list_record_files())} 件")
        st.divider()
        st.markdown(
            "**使い方**\n"
            "1. 練習内容を入力\n"
            "2. 「アドバイスをもらう」をクリック\n"
            "3. 「練習記録」タブで過去を確認"
        )

    tab_advice, tab_history = st.tabs(["コーチに相談", "練習記録"])

    with tab_advice:
        render_advice_tab()

    with tab_history:
        render_history_tab()


if __name__ == "__main__":
    main()
