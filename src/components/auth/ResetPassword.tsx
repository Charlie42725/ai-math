"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();

  // 檢查 URL hash 中的 recovery token
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setTokenValid(true);
    } else {
      setError("重設連結無效或已過期");
    }
  }, []);

  // 密碼強度檢查（與 Signup.tsx 相同）
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

  // 密碼強度指示器（與 Signup.tsx 相同）
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

  const handleResetPassword = async (e: React.FormEvent) => {
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
      setError("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('session')) {
          setError("重設連結已過期，請重新申請");
        } else {
          setError(error.message);
        }
      } else {
        setSuccess("密碼已重設，將在 2 秒後跳轉至登入頁面");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("無法重設密碼，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 如果 token 無效，顯示錯誤
  if (!tokenValid && error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                重新申請密碼重設連結
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* 重設密碼卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">重設密碼</h1>
            <p className="text-gray-600">輸入新密碼以重設您的帳戶</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新密碼
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
              {loading ? "重設中..." : "重設密碼"}
            </button>
          </form>

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
