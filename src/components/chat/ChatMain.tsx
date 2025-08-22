import React, { RefObject, FormEvent, ChangeEvent, useEffect, useRef } from "react";

// 工具函式：解析題目圖片 markdown
function renderWithImage(text: string) {
  const imgMatch = text.match(/\[題目圖片\]\(([^)]+)\)/);
  if (!imgMatch) return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
  const [before, after] = text.split(imgMatch[0]);
  return <>
    <span style={{ whiteSpace: 'pre-line' }}>{before}</span>
    <img 
      src={imgMatch[1]} 
      alt="題目圖片" 
      className="max-w-80 my-3 rounded-lg border border-slate-600/50 shadow-lg" 
    />
    <span style={{ whiteSpace: 'pre-line' }}>{after}</span>
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
  image,
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

  // 練習會考題目功能
  const handlePracticeExam = () => {
    if (loading) return;
    setInput("我要練習會考題目");
    const fakeEvent = {
      preventDefault: () => {},
    } as FormEvent<HTMLFormElement>;
    handleSend(fakeEvent);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* 訊息顯示區 - 固定高度，可滾動 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          /* 歡迎畫面 */
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🧮</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                AI Math Assistant
              </h1>
              <p className="text-slate-400 text-lg mb-8 max-w-md">
                你的專屬數學學習夥伴，準備好開始探索數學的奧秘了嗎？
              </p>
            </div>
            
            {/* 快速開始按鈕 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <button
                onClick={handlePracticeExam}
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 
                          border border-indigo-400/30 hover:border-indigo-400/50 
                          transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                <h3 className="font-semibold text-lg mb-2">練習會考題目</h3>
                <p className="text-slate-400 text-sm">挑戰歷年會考數學題目</p>
              </button>
              
              <button
                onClick={() => setInput("幫我解釋二次函數")}
                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 
                          border border-emerald-400/30 hover:border-emerald-400/50 
                          transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💡</div>
                <h3 className="font-semibold text-lg mb-2">概念學習</h3>
                <p className="text-slate-400 text-sm">深入理解數學概念</p>
              </button>
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
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                  {/* 頭像 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}>
                    <span className="text-lg">
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                  </div>

                  {/* 訊息氣泡 */}
                  <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-slate-700/50 text-white border border-slate-600/50'
                  }`}>
                    {message.parts.map((part, partIndex) => (
                      <div key={partIndex}>
                        {part.image && (
                          <img 
                            src={part.image} 
                            alt="User uploaded" 
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-2xl px-4 py-3 border border-slate-600/50">
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
      <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
        <form onSubmit={handleSend} className="space-y-4">
          {/* 圖片預覽 */}
          {image && (
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600/50">
              <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
              <span className="text-slate-300 text-sm">圖片已準備上傳</span>
              <button
                type="button"
                onClick={() => {/* 清除圖片邏輯 */}}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* 輸入框區域 */}
          <div className="flex gap-3 items-end">
            {/* 圖片上傳按鈕 */}
            <label className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 cursor-pointer transition-colors border border-slate-600/50 hover:border-slate-500/50">
              <span className="text-lg">📎</span>
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
                placeholder="輸入你的數學問題... (Enter 送出，Shift+Enter 換行)"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder:text-slate-400 
                          focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200
                          border border-slate-600/50 hover:border-slate-500/50 resize-none min-h-[48px] max-h-32"
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>

            {/* 送出按鈕 */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 
                        hover:from-indigo-600 hover:to-purple-700 text-white font-semibold
                        transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 
                        disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <LoadingDots /> : (
                <>
                  <span>送出</span>
                  <span className="text-lg">🚀</span>
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
