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
  return (
    <aside className="w-[340px] bg-[#1a1530] p-6 flex flex-col gap-6 border-r border-[#28204a] min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#28204a] flex items-center justify-center">
          <span className="text-2xl">🧮</span>
        </div>
        <span className="text-xl font-bold tracking-wide">Chat History</span>
      </div>
      <input
        className="w-full px-3 py-2 rounded bg-[#221a3a] text-white placeholder:text-[#aaa] focus:outline-none mb-4"
        placeholder="Search chats..."
      />
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#aaa] text-xs">Today</div>
          {props.user && (
            <button
              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
              onClick={async () => {
                if (props.user) {
                  const { data } = await (await import("@/lib/chatHistory")).saveChatHistory(props.user.id, []);
                  props.setMessages([]);
                  // 重新 fetch chatHistories 並設 activeChatId 為最新一筆
                  const { data: allChats } = await props.fetchChatHistories(props.user.id);
                  if (allChats && allChats.length > 0) {
                    props.setActiveChatId(allChats[0].id);
                  }
                  props.setChatHistories(allChats || []);
                } else {
                  props.setMessages([]);
                  props.setActiveChatId(null);
                }
              }}
            >＋ 新增對話</button>
          )}
        </div>
        {props.user && props.chatHistories.length > 0 ? (
          props.chatHistories.map((chat) => (
            <div
              key={chat.id}
              className="relative group bg-[#28204a] rounded px-4 py-3 mb-2 flex items-center justify-between cursor-pointer hover:bg-[#32285a]"
              onClick={async () => {
                const { data } = await props.fetchChatHistoryById(chat.id);
                if (data?.messages) {
                  props.setMessages(data.messages);
                  props.setActiveChatId(chat.id);
                }
              }}
            >
              {props.renameId === chat.id ? (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    await props.renameChatHistory(chat.id, props.renameValue);
                    props.setRenameId(null);
                    if (props.user) {
                      props.fetchChatHistories(props.user.id).then(({ data }) => {
                        if (data) props.setChatHistories(data);
                      });
                    }
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <input
                    className="flex-1 px-2 py-1 rounded bg-[#18132a] text-white text-sm border border-[#444] focus:outline-none"
                    value={props.renameValue}
                    onChange={e => props.setRenameValue(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white">儲存</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-[#444] text-white" onClick={() => props.setRenameId(null)}>取消</button>
                </form>
              ) : (
                <>
                  <span className="truncate max-w-[160px]">{chat.title}</span>
                  <button
                    className="ml-2 text-lg px-2 py-1 rounded hover:bg-[#32285a]"
                    onClick={e => {
                      e.stopPropagation();
                      props.setMenuOpenId(props.menuOpenId === chat.id ? null : chat.id);
                      props.setRenameValue(chat.title);
                    }}
                  >⋮</button>
                  {props.menuOpenId === chat.id && (
                    <div className="absolute right-2 top-10 bg-[#18132a] border border-[#444] rounded shadow-lg z-30 min-w-[120px]">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-[#28204a] text-white text-sm"
                        onClick={e => {
                          e.stopPropagation();
                          props.setRenameId(chat.id);
                          props.setMenuOpenId(null);
                        }}
                      >重新命名</button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-[#28204a] text-red-400 text-sm"
                        onClick={async e => {
                          e.stopPropagation();
                          await props.deleteChatHistory(chat.id);
                          props.setMenuOpenId(null);
                          if (props.user) {
                            props.fetchChatHistories(props.user.id).then(({ data }) => {
                              if (data) props.setChatHistories(data);
                            });
                          }
                        }}
                      >刪除</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="bg-[#28204a] rounded px-4 py-3 mb-2 flex items-center justify-between">
            <span>New Chat</span>
            <span className="text-lg">⋮</span>
          </div>
        )}
      </div>
      <button className="w-full mt-auto py-3 rounded bg-[#28204a] hover:bg-[#32285a] text-white font-semibold transition">Delete Chat History</button>
    </aside>
  );
};

export default ChatSidebar;
