import React, { FormEvent, ChangeEvent, useState, useEffect, useRef } from "react";
import FlashCard from "@/components/flashcard/FlashCard";
import { useExam } from "@/contexts/ExamContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useFlashCard } from "@/hooks/useFlashCard";
import { searchChatHistories, groupChatsByDate } from "@/lib/chatHistory";
import { useRouter } from "next/navigation";
import { ChatHistory } from "@/types";


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
  sendMessage?: (message: string) => Promise<void>;
  onCloseSidebar?: () => void;
  theme: 'minimal' | 'gradient';
}

const ChatSidebar: React.FC<ChatSidebarProps> = (props) => {
  const router = useRouter();
  const { getRandomQuestion } = useExam();

  // 使用改進的 useFlashCard hook
  const {
    showFlashCard,
    flashCardData,
    loadingFlashCard,
    setShowFlashCard,
    handleDontUnderstand: handleFlashCardDontUnderstand,
    handleRestart,
  } = useFlashCard({
    onClearChat: () => {
      props.setActiveChatId(null);
      props.setMessages([]);
    },
    sendMessage: props.sendMessage,
  });
  
  // 搜尋狀態
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatHistory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // 新增對話狀態 - 防止重複點擊
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const createChatTimeout = useRef<NodeJS.Timeout | null>(null);

  // 使用 debounce 處理搜尋
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 清理函數
  useEffect(() => {
    return () => {
      if (createChatTimeout.current) {
        clearTimeout(createChatTimeout.current);
      }
    };
  }, []);

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

  // 對話列表去重處理 - 更強化的去重邏輯
  const uniqueChatHistories = React.useMemo(() => {
    const seen = new Map();
    const filtered = [];
    
    for (const chat of props.chatHistories) {
      if (!seen.has(chat.id)) {
        seen.set(chat.id, true);
        filtered.push(chat);
      }
    }
    
    return filtered;
  }, [props.chatHistories]);

  // 搜尋結果也要去重
  const uniqueSearchResults = React.useMemo(() => {
    const seen = new Map();
    const filtered = [];
    
    for (const chat of searchResults) {
      if (!seen.has(chat.id)) {
        seen.set(chat.id, true);
        filtered.push(chat);
      }
    }
    
    return filtered;
  }, [searchResults]);

  // 決定要顯示的對話列表（搜尋結果 or 一般列表）
  const displayChats = showSearchResults ? uniqueSearchResults : uniqueChatHistories;
  
  // 對搜尋結果進行分組
  const groupedChats = showSearchResults ? groupChatsByDate(uniqueSearchResults) : groupChatsByDate(uniqueChatHistories);

  // 渲染對話項目
  const renderChatItem = (chat: ChatHistory) => (
    <div key={chat.id} className="relative group">
      {props.renameId === chat.id ? (
        <form
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            await props.renameChatHistory(chat.id, props.renameValue);
            props.setRenameId(null);
            // 使用防抖更新 - 避免重複調用
            setTimeout(async () => {
              if (props.user) {
                const { data } = await props.fetchChatHistories(props.user.id);
                if (data) {
                  // 更強化的去重處理
                  const chatMap = new Map();
                  for (const chatItem of data) {
                    if (!chatMap.has(chatItem.id)) {
                      chatMap.set(chatItem.id, chatItem);
                    }
                  }
                  const uniqueChats = Array.from(chatMap.values());
                  props.setChatHistories(uniqueChats);
                }
              }
            }, 200);
          }}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            props.theme === 'gradient'
              ? 'bg-purple-50/50 border-purple-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <input
            value={props.renameValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => props.setRenameValue(e.target.value)}
            className="w-full bg-transparent text-gray-800 focus:outline-none"
            autoFocus
            onBlur={() => props.setRenameId(null)}
          />
        </form>
      ) : (
        <div
          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group-hover:shadow-sm ${
            props.theme === 'gradient'
              ? 'bg-purple-50/50 hover:bg-purple-100/50 border-transparent hover:border-purple-200'
              : 'bg-slate-50 hover:bg-slate-100 border-transparent hover:border-slate-200'
          }`}
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
              // 移動裝置上點擊對話後關閉側邊欄
              if (props.onCloseSidebar) {
                props.onCloseSidebar();
              }
            }
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium truncate mr-2">
              {chat.title || "新對話"}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200
                         transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                props.setMenuOpenId(props.menuOpenId === chat.id ? null : chat.id);
              }}
            >
              <span className="text-gray-500 hover:text-gray-700">⋮</span>
            </button>
          </div>

          {/* 對話預覽 */}
          {chat.messages && chat.messages.length > 0 && (
            <p className="text-gray-500 text-sm mt-1 truncate">
              {chat.messages[chat.messages.length - 1]?.parts?.[0]?.text || "無訊息"}
            </p>
          )}

          {/* 建立時間 (只在搜尋模式顯示) */}
          {showSearchResults && chat.created_at && (
            <p className="text-gray-400 text-xs mt-1">
              {new Date(chat.created_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* 選單 */}
      {props.menuOpenId === chat.id && (
        <div className={`absolute right-0 top-full mt-1 rounded-lg shadow-lg border z-10 overflow-hidden ${
          props.theme === 'gradient'
            ? 'bg-white/95 backdrop-blur-sm border-purple-200'
            : 'bg-white border-slate-200'
        }`}>
          <button
            className={`w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors ${
              props.theme === 'gradient' ? 'hover:bg-purple-50' : 'hover:bg-slate-50'
            }`}
            onClick={() => {
              props.setRenameValue(chat.title);
              props.setRenameId(chat.id);
              props.setMenuOpenId(null);
            }}
          >
            重新命名
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={async () => {
              await props.deleteChatHistory(chat.id);
              // 使用防抖更新 - 避免重複調用
              setTimeout(async () => {
                if (props.user) {
                  const { data } = await props.fetchChatHistories(props.user.id);
                  if (data) {
                    // 更強化的去重處理
                    const chatMap = new Map();
                    for (const chatItem of data) {
                      if (!chatMap.has(chatItem.id)) {
                        chatMap.set(chatItem.id, chatItem);
                      }
                    }
                    const uniqueChats = Array.from(chatMap.values());
                    props.setChatHistories(uniqueChats);
                  }
                }
              }, 200);
              props.setMenuOpenId(null);
            }}
          >
            刪除
          </button>
        </div>
      )}
    </div>
  );

  // 渲染分組標題
  const renderGroupTitle = (title: string, count: number) => (
    count > 0 && (
      <div className="text-gray-500 text-sm font-medium mb-2 mt-4 first:mt-0">
        {title} ({count})
      </div>
    )
  );

  return (
    <div className="h-full flex flex-col">
      {/* 標題區 */}
      <div className={`p-6 border-b transition-all duration-300 ${
        props.theme === 'gradient'
          ? 'border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50'
          : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            props.theme === 'gradient'
              ? 'bg-gradient-to-br from-purple-400 to-pink-400'
              : 'bg-slate-100'
          }`}>
            <span className="text-xl">💬</span>
          </div>
          <span className={`text-xl font-bold ${
            props.theme === 'gradient'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
              : 'text-gray-700'
          }`}>
            歷史紀錄
          </span>
        </div>

        {/* 搜尋框 */}
        <div className="relative">
          <input
            className={`w-full px-4 py-2.5 pr-10 rounded-xl text-gray-800 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 transition-all duration-200 border ${
              props.theme === 'gradient'
                ? 'bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300 focus:ring-purple-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 focus:ring-slate-300'
            }`}
            placeholder="搜尋對話紀錄..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/* 清除搜尋按鈕 */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
          {/* 搜尋指示器 */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* 對話列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
        {/* 搜尋模式或一般模式的標題 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500 text-sm font-medium">
            {showSearchResults ? (
              searchResults.length > 0 ? `搜尋結果 (${searchResults.length})` : "找不到符合的對話"
            ) : (
              "最近對話"
            )}
          </div>
          {props.user && !showSearchResults && (
            <button
              className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium
                         transition-all duration-200 shadow-sm hover:shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed ${
                props.theme === 'gradient'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  : 'bg-slate-700 hover:bg-slate-800'
              }`}
              disabled={isCreatingNewChat || props.loading}
              onClick={async () => {
                if (props.user && !props.loading && !isCreatingNewChat) {
                  setIsCreatingNewChat(true);
                  
                  // 清除之前的定時器
                  if (createChatTimeout.current) {
                    clearTimeout(createChatTimeout.current);
                  }
                  
                  try {
                    // 清空當前訊息，準備新對話
                    props.setMessages([]);
                    props.setActiveChatId(null);
                    
                    // 同時清空可能的 pending 狀態（如果 Chat 組件有的話）
                    // 這樣確保真正開始全新對話
                    
                  } catch (error) {
                    console.error('準備新對話失敗:', error);
                  } finally {
                    // 快速重置狀態
                    setTimeout(() => {
                      setIsCreatingNewChat(false);
                    }, 500);
                  }
                }
              }}
            >
              {isCreatingNewChat ? "準備中..." : "新對話"}
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
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-gray-600 mb-2">找不到符合的對話</p>
              <p className="text-gray-400 text-sm">試試其他關鍵字</p>
            </div>
          )
        ) : (
          // 一般對話列表
          uniqueChatHistories.length > 0 ? (
            uniqueChatHistories.map(renderChatItem)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💭</span>
              </div>
              <p className="text-gray-600 mb-2">還沒有對話紀錄</p>
              <p className="text-gray-400 text-sm">開始新對話吧！</p>
            </div>
          )
        )}
      </div>

      {/* 底部工具列 */}
      <div className={`p-4 border-t space-y-2 transition-all duration-300 ${
        props.theme === 'gradient'
          ? 'border-purple-200 bg-gradient-to-br from-purple-50/30 to-pink-50/30'
          : 'border-slate-200'
      }`}>
        <button
          className={`w-full py-2.5 rounded-xl text-sm md:text-base font-medium transition-all duration-200 border ${
            props.theme === 'gradient'
              ? 'bg-green-50/80 hover:bg-green-100/80 text-green-700 border-green-200 hover:border-green-300 backdrop-blur-sm'
              : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300'
          }`}
          onClick={() => router.push('/test')}
        >
          會考模擬題
        </button>
        <button
          className={`w-full py-2.5 rounded-xl text-sm md:text-base font-medium transition-all duration-200 border ${
            props.theme === 'gradient'
              ? 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-200 hover:border-purple-300'
              : 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 hover:border-violet-300'
          }`}
          onClick={() => setShowFlashCard(true)}
        >
          抽卡練習
        </button>
        {showFlashCard && (
          <FlashCard
            question={flashCardData.question}
            answer={flashCardData.answer}
            onDontUnderstand={handleFlashCardDontUnderstand}
            onClose={() => setShowFlashCard(false)}
            onRestart={handleRestart}
            loading={loadingFlashCard}
            showAsModal={true}
          />
        )}
        <button
          className={`w-full py-2.5 rounded-xl text-sm md:text-base font-medium transition-all duration-200 border ${
            props.theme === 'gradient'
              ? 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border-blue-200 hover:border-blue-300 backdrop-blur-sm'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300'
          }`}
          onClick={() => router.push('/analyze')}
        >
          AI分析報表
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
