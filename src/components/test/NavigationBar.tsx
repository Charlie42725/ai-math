'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DEV_MODE, ADMIN_USER } from '@/lib/devAuth';

const NavigationBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: '會考練習', href: '/test', icon: '📝' },
    { name: '對話', href: '/chat', icon: '💬' },
    { name: '報表', href: '/analyze', icon: '📊' },
    { name: '復盤', href: '/test-history', icon: '🔍' },
  ];

  // 檢查用戶登入狀態
  useEffect(() => {
    const checkUser = async () => {
      if (DEV_MODE) {
        setUser({ id: ADMIN_USER.id, email: ADMIN_USER.email });
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data?.user ? { id: data.user.id, email: data.user.email } : null);
    };

    checkUser();

    if (!DEV_MODE) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      });

      return () => {
        listener?.subscription.unsubscribe();
      };
    }
  }, []);

  // 當路由改變時關閉選單
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // 防止背景滾動（當選單打開時）
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // 登出功能
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (DEV_MODE) {
        localStorage.removeItem('dev_user');
      } else {
        // 使用 signOut 並清除所有 session
        await supabase.auth.signOut({ scope: 'local' });
      }

      // 清除本地狀態
      setUser(null);
      setIsMenuOpen(false);

      // 跳轉到首頁並強制刷新頁面以清除所有狀態
      router.push('/');

      // 延遲刷新以確保路由跳轉完成
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('登出失敗:', error);
      // 即使出錯也強制刷新
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 bg-stone-50 border-b border-stone-200 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo 區域 */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-xl sm:text-2xl">📐</span>
                <span className="text-base sm:text-xl font-semibold text-stone-800">數學練習</span>
                <span className="text-base sm:text-xl font-semibold text-stone-800 hidden sm:inline">平台</span>
              </Link>
            </div>

            {/* 漢堡選單按鈕 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-stone-100 transition-colors touch-manipulation"
              aria-label="選單"
            >
              <svg
                className="w-6 h-6 text-stone-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 滑出式選單 - 所有裝置 */}
      <div
        className={`
          fixed inset-0 z-50 transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-stone-900/40"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* 選單內容 */}
        <div
          className={`
            absolute top-0 right-0 h-full w-80 sm:w-96 bg-stone-50 shadow-xl
            transform transition-transform duration-300 ease-out
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* 選單標題 */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 bg-stone-100">
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl">📐</span>
              <div>
                <span className="text-lg sm:text-xl font-semibold text-stone-800 block">選單</span>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md hover:bg-stone-200 transition-colors touch-manipulation"
              aria-label="關閉選單"
            >
              <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 選單項目 */}
          <div className="p-4 sm:p-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 sm:space-x-4 px-4 sm:px-5 py-3 sm:py-4 rounded-lg font-medium transition-colors
                    ${isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'text-stone-700 hover:bg-stone-200'
                    }
                  `}
                >
                  <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="text-base sm:text-lg block">{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 選單底部資訊 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-stone-200 bg-stone-100">
            {user ? (
              // 已登入：顯示用戶資訊和登出按鈕
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-stone-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {user.email || '用戶'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{isLoggingOut ? '登出中...' : '登出'}</span>
                </button>
              </div>
            ) : (
              // 未登入：顯示登入/註冊按鈕
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  登入
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center px-4 py-3 bg-white hover:bg-stone-50 text-stone-700 rounded-lg font-medium transition-colors border border-stone-300"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
