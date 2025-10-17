import { useReducer, useCallback } from "react";
import { Message, ChatHistory, User } from "@/types";

// 狀態定義
export type ChatState = {
  user: User | null;
  chatHistories: ChatHistory[];
  activeChatId: string | null;
  messages: Message[];
  input: string;
  image: string | null;
  loading: boolean;
  isSavingChat: boolean;
  isUpdatingHistories: boolean;
  menuOpenId: string | null;
  renameId: string | null;
  renameValue: string;
  pendingChatId: string | null;
  newChatSaved: boolean;
};

// 動作定義
export type ChatAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CHAT_HISTORIES"; payload: ChatHistory[] }
  | { type: "SET_ACTIVE_CHAT_ID"; payload: string | null }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_IMAGE"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING_CHAT"; payload: boolean }
  | { type: "SET_UPDATING_HISTORIES"; payload: boolean }
  | { type: "SET_MENU_OPEN_ID"; payload: string | null }
  | { type: "SET_RENAME_ID"; payload: string | null }
  | { type: "SET_RENAME_VALUE"; payload: string }
  | { type: "SET_PENDING_CHAT_ID"; payload: string | null }
  | { type: "SET_NEW_CHAT_SAVED"; payload: boolean }
  | { type: "RESET_CHAT" };

// 初始狀態
const initialState: ChatState = {
  user: null,
  chatHistories: [],
  activeChatId: null,
  messages: [],
  input: "",
  image: null,
  loading: false,
  isSavingChat: false,
  isUpdatingHistories: false,
  menuOpenId: null,
  renameId: null,
  renameValue: "",
  pendingChatId: null,
  newChatSaved: false,
};

// Reducer 函數
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_CHAT_HISTORIES":
      return { ...state, chatHistories: action.payload };

    case "SET_ACTIVE_CHAT_ID":
      return { ...state, activeChatId: action.payload };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_INPUT":
      return { ...state, input: action.payload };

    case "SET_IMAGE":
      return { ...state, image: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_SAVING_CHAT":
      return { ...state, isSavingChat: action.payload };

    case "SET_UPDATING_HISTORIES":
      return { ...state, isUpdatingHistories: action.payload };

    case "SET_MENU_OPEN_ID":
      return { ...state, menuOpenId: action.payload };

    case "SET_RENAME_ID":
      return { ...state, renameId: action.payload };

    case "SET_RENAME_VALUE":
      return { ...state, renameValue: action.payload };

    case "SET_PENDING_CHAT_ID":
      return { ...state, pendingChatId: action.payload };

    case "SET_NEW_CHAT_SAVED":
      return { ...state, newChatSaved: action.payload };

    case "RESET_CHAT":
      return {
        ...state,
        messages: [],
        input: "",
        image: null,
        activeChatId: null,
        pendingChatId: null,
      };

    default:
      return state;
  }
}

// Hook
export function useChatState() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // 便利函數
  const setUser = useCallback((user: User | null) => {
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const setChatHistories = useCallback((histories: ChatHistory[]) => {
    dispatch({ type: "SET_CHAT_HISTORIES", payload: histories });
  }, []);

  const setActiveChatId = useCallback((id: string | null) => {
    dispatch({ type: "SET_ACTIVE_CHAT_ID", payload: id });
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    dispatch({ type: "SET_MESSAGES", payload: messages });
  }, []);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  }, []);

  const setInput = useCallback((input: string) => {
    dispatch({ type: "SET_INPUT", payload: input });
  }, []);

  const setImage = useCallback((image: string | null) => {
    dispatch({ type: "SET_IMAGE", payload: image });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: "RESET_CHAT" });
  }, []);

  return {
    state,
    dispatch,
    // 便利函數
    setUser,
    setChatHistories,
    setActiveChatId,
    setMessages,
    addMessage,
    setInput,
    setImage,
    setLoading,
    resetChat,
  };
}
