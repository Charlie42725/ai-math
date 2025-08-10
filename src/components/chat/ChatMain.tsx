import React, { RefObject, FormEvent, ChangeEvent } from "react";
// 工具函式：解析題目圖片 markdown
function renderWithImage(text: string) {
  const imgMatch = text.match(/\[題目圖片\]\(([^)]+)\)/);
  if (!imgMatch) return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
  const [before, after] = text.split(imgMatch[0]);
  return <>
    <span style={{ whiteSpace: 'pre-line' }}>{before}</span>
    <img src={imgMatch[1]} alt="題目圖片" style={{ maxWidth: 320, margin: '12px 0', borderRadius: 8, border: '1px solid #444' }} />
    <span style={{ whiteSpace: 'pre-line' }}>{after}</span>
  </>;
}

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
  // 新增：會考題目練習功能
  const handlePracticeExam = () => {
    if (loading) return;
    setInput("我要練習會考題目");
    setTimeout(() => {
      // 模擬送出
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSend(fakeEvent);
    }, 0);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      {messages.length === 0 && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-6 mt-8 text-center">Math AI</h1>
          <p className="text-lg text-center mb-8 text-[#e0e0e0]">
            The most powerful math solver AI on the market. Math AI solves everything from basic algebra to advanced calculus, delivering precise answers and step-by-step explanations. Effortlessly generate graphs, plots, and visualizations to deepen your understanding of any problem. Whether you’re a student, educator, or enthusiast, Math AI offers unmatched accuracy and clarity, making math easier to learn, teach, and explore.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-6 py-2 min-w-[100px] whitespace-nowrap text-center rounded-full bg-[#28204a] hover:bg-[#32285a] text-white font-medium text-base transition"
                disabled={loading}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Chat messages */}
      <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "self-end items-end" : "self-start items-start"}`}
          >
            {msg.parts?.map((part, i) =>
              part.image ? (
                <img
                  key={i}
                  src={part.image}
                  alt="user upload"
                  className="mb-1 w-32 h-32 object-cover rounded border border-[#444]"
                />
              ) : (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-lg max-w-[90%] min-w-[80px] text-left break-words ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-[#28204a] text-[#e0e0e0]"}`}
                  style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                >
                  {part.text ? renderWithImage(part.text) : null}
                </div>
              )
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start px-4 py-3 rounded-lg bg-[#28204a] text-[#e0e0e0] opacity-70 max-w-[90%]">AI 回覆中...</div>
        )}
      </div>
      {/* Message input area */}
      <form className="w-full max-w-2xl flex items-center gap-3 mt-auto mb-4" onSubmit={handleSend}>
        {/* 會考題目練習按鈕 */}
        <button
          type="button"
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          style={{ minWidth: 100 }}
          onClick={handlePracticeExam}
          disabled={loading}
        >
          會考題目練習
        </button>
        <input
          ref={inputRef}
          className="flex-1 px-4 py-3 rounded bg-[#221a3a] text-white placeholder:text-[#aaa] focus:outline-none"
          placeholder="Message Math AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <label className="cursor-pointer px-3 py-2 bg-[#28204a] rounded-lg hover:bg-[#32285a] text-white transition-colors">
          上傳圖片
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleImageChange}
            disabled={loading}
          />
        </label>
        {image && (
          <img src={image} alt="preview" className="w-12 h-12 object-cover rounded ml-2 border border-[#444]" />
        )}
        <button
          type="submit"
          className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60"
          disabled={loading || (!input.trim() && !image)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </main>
  );
};

export default ChatMain;
