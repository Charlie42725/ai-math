import React, { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchChatHistories, groupChatsByDate } from "@/lib/chatHistory";
import { useRouter } from "next/navigation";

type ChatHistory = {
  id: string;
  title: string;
  messages: any[];
  created_at?: string;
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
  const router = useRouter();
  
  // 搜尋狀態
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatHistory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 使用 debounce 處理搜尋
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 當 debounced query 改變時執行搜尋
  useEffect(() => {
    const performSearch = async () => {
      if (!props.user) return;
      
      setIsSearching(true);
      try {
        const { data } = await searchChatHistories(props.user.id, debouncedSearchQuery);
        if (data) {
          setSearchResults(data.map((c: any) => ({ ...c, messages: c.messages || [] })));
          setShowSearchResults(debouncedSearchQuery.trim() !== "");
        }
      } catch (error) {
        console.error("搜尋失敗:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, props.user]);

  // 處理搜尋輸入變化
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 清除搜尋
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

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

  // 決定要顯示的對話列表（搜尋結果 or 一般列表）
  const displayChats = showSearchResults ? searchResults : uniqueChatHistories;
  
  // 對搜尋結果進行分組
  const groupedChats = showSearchResults ? groupChatsByDate(searchResults) : groupChatsByDate(uniqueChatHistories);

  // 渲染對話項目
  const renderChatItem = (chat: ChatHistory) => (
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
            // 如果在搜尋模式下，導航到對話頁面
            if (showSearchResults) {
              router.push(`/chat/${chat.id}`);
              return;
            }
            
            // 原本的邏輯
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
          {chat.messages && chat.messages.length > 0 && (
            <p className="text-slate-400 text-sm mt-1 truncate">
              {chat.messages[chat.messages.length - 1]?.parts?.[0]?.text || "No messages"}
            </p>
          )}
          
          {/* 建立時間 (只在搜尋模式顯示) */}
          {showSearchResults && chat.created_at && (
            <p className="text-slate-500 text-xs mt-1">
              {new Date(chat.created_at).toLocaleString()}
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
  );

  // 渲染分組標題
  const renderGroupTitle = (title: string, count: number) => (
    count > 0 && (
      <div className="text-slate-400 text-sm font-medium mb-2 mt-4 first:mt-0">
        {title} ({count})
      </div>
    )
  );

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
        <div className="relative">
          <input
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-700/50 text-white placeholder:text-slate-400 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200
                       border border-slate-600/50 hover:border-slate-500/50"
            placeholder="🔍 Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/* 清除搜尋按鈕 */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
          {/* 搜尋指示器 */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* 對話列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
        {/* 搜尋模式或一般模式的標題 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-sm font-medium">
            {showSearchResults ? (
              searchResults.length > 0 ? `搜尋結果 (${searchResults.length})` : "找不到符合的對話"
            ) : (
              "Recent Chats"
            )}
          </div>
          {props.user && !showSearchResults && (
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
        {showSearchResults ? (
          // 搜尋結果顯示
          searchResults.length > 0 ? (
            <div>
              {/* 今天 */}
              {renderGroupTitle("今天", groupedChats.today.length)}
              {groupedChats.today.map(renderChatItem)}
              
              {/* 昨天 */}
              {renderGroupTitle("昨天", groupedChats.yesterday.length)}
              {groupedChats.yesterday.map(renderChatItem)}
              
              {/* 更早 */}
              {renderGroupTitle("更早", groupedChats.earlier.length)}
              {groupedChats.earlier.map(renderChatItem)}
            </div>
          ) : (
            // 沒有搜尋結果
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-slate-400 mb-2">找不到符合的對話</p>
              <p className="text-slate-500 text-sm">試試其他關鍵字</p>
            </div>
          )
        ) : (
          // 一般對話列表
          uniqueChatHistories.length > 0 ? (
            uniqueChatHistories.map(renderChatItem)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <span className="text-2xl">💭</span>
              </div>
              <p className="text-slate-400 mb-2">No conversations yet</p>
              <p className="text-slate-500 text-sm">Start a new chat to begin!</p>
            </div>
          )
        )}
      </div>

      {/* 底部工具列 */}
      <div className="p-4 border-t border-slate-700/50">
        <button 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 
                     hover:from-blue-500/20 hover:to-indigo-500/20 text-blue-400 
                     font-medium transition-all duration-200 border border-blue-500/20 
                     hover:border-blue-400/30"
          onClick={() => router.push('/analyze')}
        >
          📊 AI分析報表
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
