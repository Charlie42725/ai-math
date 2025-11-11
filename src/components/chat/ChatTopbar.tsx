import React from "react";

interface ChatTopbarProps {
  user: { id: string } | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

const ChatTopbar: React.FC<ChatTopbarProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <div className="h-16 px-4 md:px-6 border-b border-slate-200 flex items-center justify-between bg-white">
      {/* 左側：漢堡選單 + 對話資訊 */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* 漢堡選單按鈕 (僅移動裝置顯示) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="開啟選單"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🤖</span>
        </div>
        <div className="hidden sm:block">
          <h2 className="font-semibold text-gray-700">AI 數學助理</h2>
          <p className="text-gray-500 text-xs md:text-sm hidden md:block">準備好幫助您解決數學問題</p>
        </div>
        <h2 className="sm:hidden font-semibold text-gray-700">AI 助理</h2>
      </div>

      {/* 右側：用戶操作 */}
      <div className="flex items-center gap-2 md:gap-3">
        {user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600
                         text-sm md:text-base font-medium transition-all duration-200 border border-red-200"
            >
              登出
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <a
              href="/login"
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700
                         text-sm md:text-base font-medium transition-all duration-200 border border-slate-200"
            >
              登入
            </a>
            <a
              href="/signup"
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white
                         text-sm md:text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="hidden sm:inline">免費註冊</span>
              <span className="sm:hidden">註冊</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
