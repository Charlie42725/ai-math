"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, clearAuthState } from '@/lib/supabase';
import { DEV_MODE, ADMIN_USER } from "@/lib/devAuth";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  loadingComponent,
  fallbackComponent
}: AuthGuardProps) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 開發模式：直接使用管理員帳號
        if (DEV_MODE) {
          setUser({ id: ADMIN_USER.id, email: ADMIN_USER.email });
          setLoading(false);
          return;
        }

        // 正常模式：檢查 Supabase Auth
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          // 如果是 refresh token 錯誤，清理本地存儲
          if (error.message.includes('refresh') || error.message.includes('token')) {
            console.log('Clearing invalid token from storage');
            await clearAuthState();
          }
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(data?.user ? { id: data.user.id, email: data.user.email } : null);
        setLoading(false);
      } catch (error) {
        console.error('Unexpected auth error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    // 只在非開發模式下監聽 auth 變化
    if (!DEV_MODE) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        // 處理 token 錯誤
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing storage');
          await clearAuthState();
          setUser(null);
        } else {
          setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
        }
      });

      return () => {
        listener?.subscription.unsubscribe();
      };
    }
  }, []);

  // 載入中
  if (loading) {
    if (loadingComponent) return <>{loadingComponent}</>;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-full"></div>
            </div>
          </div>
          <p className="text-lg text-gray-700 font-medium">載入中...</p>
          <p className="text-sm text-gray-500">正在驗證您的身份</p>
        </div>
      </div>
    );
  }

  // 未登入
  if (!user) {
    if (fallbackComponent) return <>{fallbackComponent}</>;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 圖示 */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* 標題 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            需要登入
          </h1>
          <p className="text-gray-600 mb-8">
            請先登入以使用此功能，開始您的數學學習之旅
          </p>

          {/* 按鈕組 */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
            >
              立即登入
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition border-2 border-gray-200 hover:border-gray-300"
            >
              還沒有帳戶？註冊
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-6 text-gray-500 hover:text-gray-700 font-medium transition"
            >
              返回首頁
            </Link>
          </div>

          {/* 功能亮點 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">✨ 登入後立即享有</p>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xl">📚</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 mb-1">會考練習系統</div>
                  <div className="text-xs text-gray-600">歷屆真題 · AI 即時批改 · 詳細解析</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xl">💬</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 mb-1">AI 數學助教</div>
                  <div className="text-xs text-gray-600">24/7 即時解答 · 觀念講解 · 解題引導</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xl">📊</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 mb-1">學習成長報告</div>
                  <div className="text-xs text-gray-600">追蹤進度 · 弱點分析 · 個人化建議</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已登入，渲染子元件
  return <>{children}</>;
}
