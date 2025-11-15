"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // 密碼強度檢查
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "密碼至少需要 8 個字元";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "密碼需包含至少一個大寫字母";
    }
    if (!/[a-z]/.test(pwd)) {
      return "密碼需包含至少一個小寫字母";
    }
    if (!/[0-9]/.test(pwd)) {
      return "密碼需包含至少一個數字";
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 驗證密碼
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // 確認密碼匹配
    if (password !== confirmPassword) {
      setError("密碼與確認密碼不一致");
      return;
    }

    setLoading(true);

    try {
      // 使用 Supabase Auth 註冊
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/chat`,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // 檢查是否需要郵件驗證
        if (data.user.identities && data.user.identities.length === 0) {
          setError("此電子郵件已被註冊");
        } else {
          setSuccess("註冊成功！請檢查您的信箱進行驗證。");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (err) {
      setError("註冊失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 密碼強度指示器
  const getPasswordStrength = (pwd: string): { strength: number; color: string; label: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 1, color: "bg-red-500", label: "弱" };
    if (strength === 3) return { strength: 2, color: "bg-yellow-500", label: "中等" };
    return { strength: 3, color: "bg-green-500", label: "強" };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Google OAuth 註冊/登入
  const handleGoogleSignup = async () => {
    try {
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Google 註冊失敗，請稍後再試");
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

        {/* 註冊卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">建立新帳戶</h1>
            <p className="text-gray-600">開始您的學習之旅</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                placeholder="至少 8 個字元"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {/* 密碼強度指示器 */}
              {password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 1 ? passwordStrength.color : "bg-gray-200"}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 2 ? passwordStrength.color : "bg-gray-200"}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 3 ? passwordStrength.color : "bg-gray-200"}`}></div>
                  </div>
                  <p className="text-xs text-gray-600">密碼強度：{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                確認密碼
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                placeholder="再次輸入密碼"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* 密碼要求提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">密碼必須包含：</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 至少 8 個字元</li>
                <li>• 至少一個大寫字母和一個小寫字母</li>
                <li>• 至少一個數字</li>
              </ul>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "註冊中..." : "建立帳戶"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已經有帳戶？{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                立即登入
              </Link>
            </p>
          </div>

          {/* 分隔線 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或使用其他方式註冊</span>
            </div>
          </div>

          {/* Google 註冊按鈕 */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 帳戶註冊
          </button>
        </div>
      </div>
    </div>
  );
}
