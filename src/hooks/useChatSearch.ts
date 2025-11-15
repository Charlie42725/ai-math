/**
 * 聊天搜尋功能 Hook
 * 處理聊天歷史的搜尋和過濾邏輯
 */

import { useState, useEffect, ChangeEvent } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchChatHistories } from '@/lib/chatHistory';
import { ChatHistory } from '@/types';

export interface UseChatSearchReturn {
  searchQuery: string;
  searchResults: ChatHistory[];
  isSearching: boolean;
  showSearchResults: boolean;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
}

/**
 * 聊天搜尋 Hook
 */
export function useChatSearch(userId: string | null): UseChatSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatHistory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 使用 debounce 處理搜尋（避免頻繁請求）
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * 當 debounced query 改變時執行搜尋
   */
  useEffect(() => {
    const performSearch = async () => {
      if (!userId) return;

      setIsSearching(true);
      try {
        const { data } = await searchChatHistories(userId, debouncedSearchQuery);
        if (data) {
          setSearchResults(
            data.map((c: any) => ({ ...c, messages: c.messages || [] }))
          );
          setShowSearchResults(debouncedSearchQuery.trim() !== '');
        }
      } catch (error) {
        console.error('搜尋失敗:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, userId]);

  /**
   * 處理搜尋輸入變化
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * 清除搜尋
   */
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    handleSearchChange,
    clearSearch,
  };
}
