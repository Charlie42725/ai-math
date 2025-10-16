import React, { FormEvent, ChangeEvent, useState, useEffect, useRef } from "react";
import FlashCard from "@/components/flashcard/FlashCard";
import examData from "@/lib/exam.json";
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
  sendMessage?: (message: string) => Promise<void>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = (props) => {
  const router = useRouter();

  // FlashCard 狀態
  const [showFlashCard, setShowFlashCard] = useState(false);
  const [flashCardData, setFlashCardData] = useState<{ question: string; answer: string }>({ question: '', answer: '' });
  const [loadingFlashCard, setLoadingFlashCard] = useState(false);



  // 生成簡單問題的輔助函數
  function generateSimpleQuestion(unit?: string, keywords?: string[]): string {
    if (unit) {
      const unitQuestions: { [key: string]: string } = {
        '算式運算': '負數運算的規則？',
        '立體圖形與展開圖': '展開圖的概念？',
        '二元一次聯立方程式': '聯立方程式怎麼解？',
        '坐標平面': '坐標的表示方法？',
        '一元二次方程式': '二次方程式求解？'
      };
      if (unitQuestions[unit]) return unitQuestions[unit];
    }
    
    if (keywords && keywords.length > 0) {
      const keyword = keywords[0];
      if (keyword.includes('坐標')) return '坐標的概念？';
      if (keyword.includes('方程式')) return '方程式的用途？';
      if (keyword.includes('圖形')) return '圖形的性質？';
      if (keyword.includes('負數')) return '負數運算規則？';
      if (keyword.includes('展開')) return '展開圖的用途？';
    }
    
    return '數學觀念練習';
  }

  async function getRandomExamQuestion() {
    const idx = Math.floor(Math.random() * (Array.isArray(examData) ? examData.length : 0));
    const item = Array.isArray(examData) ? examData[idx] : undefined;
    if (!item) return { question: '無題目', answer: '無答案' };
    
    let answerText = '無答案';
    if (item.explanation) {
      answerText = item.explanation;
    } else if (item.options && typeof item.options === 'object' && item.answer && item.options[item.answer as keyof typeof item.options]) {
      answerText = item.options[item.answer as keyof typeof item.options];
    }

    try {
      // 調用 AI 將題目轉換為觀念題
      const response = await fetch('/api/convert-to-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          answer: answerText,
          unit: item.unit,
          keywords: item.keywords
        })
      });

      if (response.ok) {
        const conceptData = await response.json();
        
        // 使用 AI 轉換的觀念問題
        const finalQuestion = conceptData.conceptQuestion || generateSimpleQuestion(item.unit, item.keywords);
        const finalAnswer = conceptData.conceptAnswer || answerText;
        
        return {
          question: finalQuestion,
          answer: finalAnswer,
        };
      }
    } catch (error) {
      console.error('AI 轉換失敗，使用原題目:', error);
    }

    // 如果 AI 轉換失敗，返回原題目
    return {
      question: item.question,
      answer: answerText,
    };
  }

  useEffect(() => {
    if (showFlashCard) {
      const loadQuestion = async () => {
        setLoadingFlashCard(true);
        try {
          const questionData = await getRandomExamQuestion();
          setFlashCardData(questionData);
        } catch (error) {
          console.error('載入題目失敗:', error);
          setFlashCardData({ question: '載入失敗', answer: '請重新嘗試' });
        } finally {
          setLoadingFlashCard(false);
        }
      };
      loadQuestion();
    }
  }, [showFlashCard]);

  async function handleDontUnderstand() {
    const questionText = flashCardData.question;
    const chatPrompt = `我不懂這個數學觀念：「${questionText}」，請詳細解釋這個概念的原理和應用方式。`;
    
    // 關閉閃卡
    setShowFlashCard(false);
    
    // 清除當前對話，開始新對話
    props.setActiveChatId(null);
    props.setMessages([]);
    
    // 發送訊息並獲得 AI 回應
    if (props.sendMessage) {
      await props.sendMessage(chatPrompt);
    }
  }

  async function handleRestart() {
    setLoadingFlashCard(true);
    try {
      const questionData = await getRandomExamQuestion();
      setFlashCardData(questionData);
    } catch (error) {
      console.error('重新載入題目失敗:', error);
      setFlashCardData({ question: '載入失敗', answer: '請重新嘗試' });
    } finally {
      setLoadingFlashCard(false);
    }
  }
  
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
              {chat.title || "新對話"}
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
              {chat.messages[chat.messages.length - 1]?.parts?.[0]?.text || "無訊息"}
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
            ✏️ 重新命名
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
            🗑️ 刪除
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
            歷史紀錄
          </span>
        </div>
        
        {/* 搜尋框 */}
        <div className="relative">
          <input
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-700/50 text-white placeholder:text-slate-400 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200
                       border border-slate-600/50 hover:border-slate-500/50"
            placeholder="🔍 搜尋對話紀錄..."
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
              "最近對話"
            )}
          </div>
          {props.user && !showSearchResults && (
            <button
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
                         hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold 
                         transition-all duration-200 shadow-md hover:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isCreatingNewChat ? "準備中..." : "✨ 新對話"}
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
              <p className="text-slate-400 mb-2">還沒有對話紀錄</p>
              <p className="text-slate-500 text-sm">開始新對話吧！</p>
            </div>
          )
        )}
      </div>

      {/* 底部工具列 */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        <button 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 
                     hover:from-green-500/20 hover:to-emerald-500/20 text-green-400 
                     font-medium transition-all duration-200 border border-green-500/20 
                     hover:border-green-400/30"
          onClick={() => router.push('/test')}
        >
          📝 會考模擬題
        </button>
        <button 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 
                     hover:from-violet-500/20 hover:to-purple-500/20 text-violet-400 
                     font-medium transition-all duration-200 border border-violet-500/20 
                     hover:border-violet-400/30"
          onClick={() => setShowFlashCard(true)}
        >
          🎴 抽卡練習
        </button>
        {showFlashCard && (
          <FlashCard
            question={flashCardData.question}
            answer={flashCardData.answer}
            onDontUnderstand={handleDontUnderstand}
            onClose={() => setShowFlashCard(false)}
            onRestart={handleRestart}
            loading={loadingFlashCard}
            showAsModal={true}
          />
        )}
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
