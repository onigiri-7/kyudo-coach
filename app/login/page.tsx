import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kyudo-50 to-kyudo-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-kyudo-600">読み込み中...</p>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
