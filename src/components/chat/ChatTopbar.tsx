import React from "react";

interface ChatTopbarProps {
  user: { id: string } | null;
  onLogout: () => void;
}

const ChatTopbar: React.FC<ChatTopbarProps> = ({ user, onLogout }) => {
  return (
    <div className="h-16 px-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30 backdrop-blur-sm">
      {/* 左側：對話資訊 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-sm">🤖</span>
        </div>
        <div>
          <h2 className="font-semibold text-white">AI Math Assistant</h2>
          <p className="text-slate-400 text-sm">Ready to help with your math questions</p>
        </div>
      </div>

      {/* 右側：用戶操作 */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 
                         font-medium transition-all duration-200 border border-red-500/20"
            >
              登出
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <a 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-white 
                         font-medium transition-all duration-200 border border-slate-600/50"
            >
              登入
            </a>
            <a 
              href="/signup" 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
                         hover:from-indigo-600 hover:to-purple-700 text-white font-medium 
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
              免費註冊
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
