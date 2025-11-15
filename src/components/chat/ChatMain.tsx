import React, { RefObject, FormEvent, ChangeEvent, useEffect, useRef } from "react";

// 工具函式：解析題目圖片 markdown 和文字格式
function renderWithImage(text: string) {
  const imgMatch = text.match(/\[題目圖片\]\(([^)]+)\)/);
  
  // 處理粗體文字的函數
  const renderFormattedText = (str: string) => {
    // 分割文字，處理 **粗體** 格式
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // 移除 ** 標記並套用粗體樣式
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold text-gray-900 dark:text-gray-100">{boldText}</strong>;
      }
      return <span key={index} style={{ whiteSpace: 'pre-line' }}>{part}</span>;
    });
  };
  
  if (!imgMatch) {
    return <>{renderFormattedText(text)}</>;
  }
  
  const [before, after] = text.split(imgMatch[0]);
  return <>
    {renderFormattedText(before)}
    <img 
      src={imgMatch[1]} 
      alt="題目圖片" 
      className="max-w-80 my-3 rounded-lg border border-slate-600/50 shadow-lg" 
    />
    {renderFormattedText(after)}
  </>;
}

// 打字機效果組件
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <span style={{ whiteSpace: 'pre-line' }}>{displayText}</span>;
};

// 載入中動畫組件
const LoadingDots: React.FC = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

type MessagePart = {
  text?: string;
  image?: string;
};

type Message = {
  role: "user" | "assistant";
  parts: MessagePart[];
};

interface ChatMainProps {
  messages: Message[];
  loading: boolean;
  tags: string[];
  input: string;
  setInput: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  handleSend: (e: FormEvent<HTMLFormElement>) => void;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  image: string | null;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  loading,
  tags,
  input,
  setInput,
  inputRef,
  handleSend,
  handleImageChange,
  image
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動滾到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 快捷鍵處理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        const fakeEvent = {
          preventDefault: () => {},
        } as FormEvent<HTMLFormElement>;
        handleSend(fakeEvent);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* 訊息顯示區 - 固定高度，可滾動 */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          /* 歡迎畫面 */
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 md:space-y-8 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
              <span className="text-3xl md:text-4xl">🧮</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-700 mb-3 md:mb-4">
                AI Math Assistant
              </h1>
              <p className="text-gray-500 text-base md:text-lg mb-6 md:mb-8 max-w-md px-4">
                你的專屬數學學習夥伴，準備好開始探索數學的奧秘了嗎？
              </p>
            </div>


          </div>
        ) : (
          /* 對話訊息 */
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                  message.role === 'user' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                }`}
              >
                <div className={`flex max-w-[90%] md:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 md:gap-3`}>
                  {/* 頭像 */}
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ${
                    message.role === 'user'
                      ? 'bg-slate-300'
                      : 'bg-slate-200'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-base md:text-lg">👤</span>
                    ) : (
                      <img
                        src="/bs/cute.png"
                        alt="AI助理"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* 訊息氣泡 */}
                  <div className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-sm text-sm md:text-base ${
                    message.role === 'user'
                      ? 'bg-slate-300 text-gray-800'
                      : 'bg-white text-gray-700 border border-slate-200'
                  }`}>
                    {message.parts.map((part, partIndex) => (
                      <div key={partIndex}>
                        {part.image && (
                          <img 
                            src={part.image} 
                            alt="使用者上傳的圖片" 
                            className="max-w-64 rounded-lg mb-2 border border-slate-600/50" 
                          />
                        )}
                        {part.text && (
                          <div className="prose prose-invert max-w-none">
                            {message.role === 'assistant' && index === messages.length - 1 ? (
                              renderWithImage(part.text)
                            ) : (
                              renderWithImage(part.text)
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* 載入中指示器 */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                    <img
                      src="/bs/cute.png"
                      alt="AI助理"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-sm">
                    <LoadingDots />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* 自動滾動錨點 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部輸入區 - 固定位置 */}
      <div className="border-t border-slate-200 bg-white p-3 md:p-6">
        <form onSubmit={handleSend} className="space-y-4">
          {/* 圖片預覽 */}
          {image && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img src={image} alt="圖片預覽" className="w-16 h-16 object-cover rounded-lg" />
              <span className="text-gray-600 text-sm">圖片已準備上傳</span>
              <button
                type="button"
                onClick={() => {/* 清除圖片邏輯 */}}
                className="ml-auto text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* 輸入框區域 */}
          <div className="flex gap-2 md:gap-3 items-end">
            {/* 圖片上傳按鈕 */}
            <label className="p-2 md:p-3 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors border border-slate-200 flex-shrink-0">
              <span className="text-base md:text-lg">📎</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* 文字輸入框 */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入你的數學問題"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-gray-800 placeholder:text-gray-400
                          focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all duration-200
                          border border-slate-200 hover:border-slate-300 resize-none
                          min-h-[48px] max-h-[200px] overflow-y-auto custom-input-scrollbar"
                rows={1}
                style={{ 
                  minHeight: '48px',
                  maxHeight: '200px',
                  resize: 'none',
                  lineHeight: '1.5'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  const newHeight = Math.min(target.scrollHeight, 200);
                  target.style.height = newHeight + 'px';
                  
                  // 如果內容超過最大高度，顯示滾動條
                  if (target.scrollHeight > 200) {
                    target.style.overflowY = 'auto';
                  } else {
                    target.style.overflowY = 'hidden';
                  }
                }}
              />
            </div>

            {/* 送出按鈕 */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium
                        text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50
                        disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 flex-shrink-0"
            >
              {loading ? <LoadingDots /> : (
                <>
                  <span className="hidden sm:inline">送出</span>
                  <span className="text-base md:text-lg">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatMain;
