/**
 * 閃卡功能 Hook
 * 處理閃卡的生成、載入和互動邏輯
 */

import { useState, useEffect } from 'react';
import { useExam } from '@/contexts/ExamContext';

export interface FlashCardData {
  question: string;
  answer: string;
}

export interface UseFlashCardReturn {
  showFlashCard: boolean;
  flashCardData: FlashCardData;
  loadingFlashCard: boolean;
  setShowFlashCard: (show: boolean) => void;
  handleDontUnderstand: () => Promise<void>;
  handleRestart: () => Promise<void>;
}

interface UseFlashCardOptions {
  onDontUnderstand?: (questionText: string) => Promise<void>;
  onClearChat?: () => void;
  sendMessage?: (message: string) => Promise<void>;
}

/**
 * 生成簡單問題的輔助函數
 */
function generateSimpleQuestion(unit?: string, keywords?: string[]): string {
  if (unit) {
    const unitQuestions: { [key: string]: string } = {
      算式運算: '負數運算的規則？',
      立體圖形與展開圖: '展開圖的概念？',
      二元一次聯立方程式: '聯立方程式怎麼解？',
      坐標平面: '坐標的表示方法？',
      一元二次方程式: '二次方程式求解？',
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

/**
 * 從題庫獲取隨機問題並轉換為觀念題
 */
async function getRandomExamQuestion(getRandomQuestion: () => any): Promise<FlashCardData> {
  const item = getRandomQuestion();
  if (!item) return { question: '無題目', answer: '無答案' };

  let answerText = '無答案';
  if (item.explanation) {
    answerText = item.explanation;
  } else if (
    item.options &&
    typeof item.options === 'object' &&
    item.answer &&
    item.options[item.answer as keyof typeof item.options]
  ) {
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
        keywords: item.keywords,
      }),
    });

    if (response.ok) {
      const conceptData = await response.json();

      // 使用 AI 轉換的觀念問題
      const finalQuestion =
        conceptData.conceptQuestion || generateSimpleQuestion(item.unit, item.keywords);
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

/**
 * 閃卡功能 Hook
 */
export function useFlashCard(options: UseFlashCardOptions = {}): UseFlashCardReturn {
  const { onDontUnderstand, onClearChat, sendMessage } = options;
  const { getRandomQuestion } = useExam();

  const [showFlashCard, setShowFlashCard] = useState(false);
  const [flashCardData, setFlashCardData] = useState<FlashCardData>({
    question: '',
    answer: '',
  });
  const [loadingFlashCard, setLoadingFlashCard] = useState(false);

  /**
   * 載入新的閃卡問題
   */
  const loadQuestion = async () => {
    setLoadingFlashCard(true);
    try {
      const questionData = await getRandomExamQuestion(getRandomQuestion);
      setFlashCardData(questionData);
    } catch (error) {
      console.error('載入題目失敗:', error);
      setFlashCardData({ question: '載入失敗', answer: '請重新嘗試' });
    } finally {
      setLoadingFlashCard(false);
    }
  };

  /**
   * 當閃卡顯示時，自動載入問題
   */
  useEffect(() => {
    if (showFlashCard) {
      loadQuestion();
    }
  }, [showFlashCard]);

  /**
   * 處理「不懂」按鈕
   */
  const handleDontUnderstand = async () => {
    const questionText = flashCardData.question;
    const chatPrompt = `我不懂這個數學觀念：「${questionText}」，請詳細解釋這個概念的原理和應用方式。`;

    // 關閉閃卡
    setShowFlashCard(false);

    // 清除當前對話，開始新對話
    if (onClearChat) {
      onClearChat();
    }

    // 發送訊息並獲得 AI 回應
    if (sendMessage) {
      await sendMessage(chatPrompt);
    }

    // 自定義處理（如果有提供）
    if (onDontUnderstand) {
      await onDontUnderstand(questionText);
    }
  };

  /**
   * 處理「重新載入」按鈕
   */
  const handleRestart = async () => {
    await loadQuestion();
  };

  return {
    showFlashCard,
    flashCardData,
    loadingFlashCard,
    setShowFlashCard,
    handleDontUnderstand,
    handleRestart,
  };
}
