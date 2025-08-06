import React from "react";

interface ChatTopbarProps {
  user: { id: string } | null;
  onLogout: () => void;
}

const ChatTopbar: React.FC<ChatTopbarProps> = ({ user, onLogout }) => {
  return (
    <div className="absolute top-6 right-8 z-20 flex gap-3">
      {user ? (
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded bg-[#28204a] hover:bg-[#32285a] text-white font-medium transition"
        >登出</button>
      ) : (
        <>
          <a href="/login" className="px-4 py-2 rounded bg-[#28204a] hover:bg-[#32285a] text-white font-medium transition">登入</a>
          <a href="/signup" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">免費註冊</a>
        </>
      )}
    </div>
  );
};

export default ChatTopbar;
