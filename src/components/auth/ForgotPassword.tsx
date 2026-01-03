"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError("無法傳送重設連結，請稍後再試");
      } else {
        // 總是顯示成功訊息，即使郵箱不存在（防止郵箱枚舉攻擊）
        setSubmitted(true);
      }
    } catch (err) {
      setError("無法傳送重設連結，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回首頁按鈕 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首頁
          </Link>
        </div>

        {/* 忘記密碼卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">忘記密碼？</h1>
            <p className="text-gray-600">輸入您的電子郵件以重設密碼</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "發送中..." : "發送重設連結"}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-600 mb-2">
                密碼重設連結已發送到您的信箱，請檢查您的郵件。
              </p>
              <p className="text-xs text-green-700">
                如果您沒有收到郵件，請檢查垃圾郵件資料夾，或稍後再試。
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              記起密碼了？{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                返回登入頁面
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
