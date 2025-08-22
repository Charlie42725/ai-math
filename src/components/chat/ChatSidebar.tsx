import React, { FormEvent, ChangeEvent } from "react";

type ChatHistory = {
  id: string;
  title: string;
  messages: any[];
};

interface ChatSidebarProps {
  user: { id: string } | null;
  chatHistories: ChatHistory[];
  menuOpenId: string | null;
  renameId: string | null;
  renameValue: string;
  setRenameId: (id: string | null) => void;
  setRenameValue: (v: string) => void;
  setMenuOpenId: (id: string | null) => void;
  setMessages: (msgs: any[]) => void;
  setActiveChatId: (id: string | null) => void;
  fetchChatHistoryById: (id: string) => Promise<{ data: ChatHistory | null }>;
  fetchChatHistories: (userId: string) => Promise<{ data: ChatHistory[] | null }>;
  renameChatHistory: (id: string, title: string) => Promise<void>;
  deleteChatHistory: (id: string) => Promise<void>;
  setChatHistories: (chats: ChatHistory[]) => void;
  loading: boolean;
  tags: string[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = (props) => {
  // 對話列表去重處理
  const uniqueChatHistories = React.useMemo(() => {
    const seen = new Set();
    return props.chatHistories.filter(chat => {
      if (seen.has(chat.id)) {
        return false;
      }
      seen.add(chat.id);
      return true;
    });
  }, [props.chatHistories]);

  return (
    <div className="h-full flex flex-col">
      {/* 標題區 */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">💬</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Chat History
          </span>
        </div>
        
        {/* 搜尋框 */}
        <input
          className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 text-white placeholder:text-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200
                     border border-slate-600/50 hover:border-slate-500/50"
          placeholder="🔍 Search conversations..."
        />
      </div>

      {/* 對話列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-sm font-medium">Recent Chats</div>
          {props.user && (
            <button
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
                         hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold 
                         transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={async () => {
                if (props.user && !props.loading) {
                  // 清空當前訊息
                  props.setMessages([]);
                  props.setActiveChatId(null);
                  
                  // 創建新對話
                  const { data } = await (await import("@/lib/chatHistory")).saveChatHistory(props.user.id, []);
                  if (data?.[0]?.id) {
                    props.setActiveChatId(data[0].id);
                  }
                  
                  // 重新獲取歷史記錄，但使用防抖來避免過度更新
                  const { data: updatedData } = await props.fetchChatHistories(props.user.id);
                  if (updatedData) {
                    // 去重處理
                    const uniqueChats = updatedData.filter((chat, index, arr) => 
                      arr.findIndex(c => c.id === chat.id) === index
                    );
                    props.setChatHistories(uniqueChats);
                  }
                }
              }}
            >
              ✨ New Chat
            </button>
          )}
        </div>

        {/* 對話列表內容 */}
        {uniqueChatHistories.length > 0 ? (
          uniqueChatHistories.map((chat) => (
            <div key={chat.id} className="relative group">
              {props.renameId === chat.id ? (
                <form
                  onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    await props.renameChatHistory(chat.id, props.renameValue);
                    props.setRenameId(null);
                    // 使用防抖更新
                    setTimeout(async () => {
                      const { data } = await props.fetchChatHistories(props.user!.id);
                      if (data) {
                        const uniqueChats = data.filter((chat, index, arr) => 
                          arr.findIndex(c => c.id === chat.id) === index
                        );
                        props.setChatHistories(uniqueChats);
                      }
                    }, 200);
                  }}
                  className="p-3 rounded-xl bg-slate-700/50 border border-indigo-400/50"
                >
                  <input
                    value={props.renameValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => props.setRenameValue(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none"
                    autoFocus
                    onBlur={() => props.setRenameId(null)}
                  />
                </form>
              ) : (
                <div
                  className="p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer 
                             transition-all duration-200 border border-transparent hover:border-slate-600/50
                             group-hover:shadow-md"
                  onClick={async () => {
                    const { data } = await props.fetchChatHistoryById(chat.id);
                    if (data) {
                      props.setMessages(data.messages);
                      props.setActiveChatId(chat.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate mr-2">
                      {chat.title || "New Conversation"}
                    </span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-600/50 
                                 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.setMenuOpenId(props.menuOpenId === chat.id ? null : chat.id);
                      }}
                    >
                      <span className="text-slate-400 hover:text-white">⋮</span>
                    </button>
                  </div>
                  
                  {/* 對話預覽 */}
                  {chat.messages.length > 0 && (
                    <p className="text-slate-400 text-sm mt-1 truncate">
                      {chat.messages[chat.messages.length - 1]?.parts?.[0]?.text || "No messages"}
                    </p>
                  )}
                </div>
              )}

              {/* 選單 */}
              {props.menuOpenId === chat.id && (
                <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 z-10 overflow-hidden">
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors"
                    onClick={() => {
                      props.setRenameValue(chat.title);
                      props.setRenameId(chat.id);
                      props.setMenuOpenId(null);
                    }}
                  >
                    ✏️ Rename
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={async () => {
                      await props.deleteChatHistory(chat.id);
                      // 使用防抖更新
                      setTimeout(async () => {
                        const { data } = await props.fetchChatHistories(props.user!.id);
                        if (data) {
                          const uniqueChats = data.filter((chat, index, arr) => 
                            arr.findIndex(c => c.id === chat.id) === index
                          );
                          props.setChatHistories(uniqueChats);
                        }
                      }, 200);
                      props.setMenuOpenId(null);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
              <span className="text-2xl">💭</span>
            </div>
            <p className="text-slate-400 mb-2">No conversations yet</p>
            <p className="text-slate-500 text-sm">Start a new chat to begin!</p>
          </div>
        )}
      </div>

      {/* 底部工具列 */}
      <div className="p-4 border-t border-slate-700/50">
        <button className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 
                           font-medium transition-all duration-200 border border-red-500/20">
          🗑️ Clear All History
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
