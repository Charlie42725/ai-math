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
      // 七年級
      '算式運算': '負數與分數的運算規則？',
      '整數的運算': '整數四則運算的順序？',
      '分數的運算': '分數加減乘除的法則？',
      '立體圖形與展開圖': '立體圖形的展開圖特性？',
      '生活中的立體圖形': '常見立體圖形的性質？',
      '生活中的幾何': '基本幾何圖形的特徵？',
      '一元一次方程式': '一元一次方程式的解法？',
      '直角坐標與二元一次方程式的圖形': '坐標平面與直線方程式？',
      '比與比例式': '比例的性質與應用？',

      // 八年級
      '二元一次聯立方程式': '聯立方程式的解法？',
      '一元一次不等式': '不等式的性質與解法？',
      '乘法公式與多項式': '乘法公式的應用？',
      '因式分解': '因式分解的方法？',
      '平方根與畢氏定理': '畢氏定理的應用？',
      '平行與四邊形': '平行四邊形的性質？',
      '三角形的基本性質': '三角形的內角與邊長關係？',
      '線型函數': '線型函數的圖形特性？',
      '統計': '統計量的計算與意義？',

      // 九年級
      '一元二次方程式': '二次方程式的解法？',
      '二次函數': '二次函數的圖形與性質？',
      '相似形': '相似三角形的判定與性質？',
      '圓形': '圓的性質與定理？',
      '外心、內心與重心': '三角形的心與性質？',
      '機率': '機率的計算方法？',
      '統計與機率': '統計與機率的應用？',
      '數列與級數': '數列的規律與求和？',
      '規律與數列': '數列的通項公式？',
    };
    if (unitQuestions[unit]) return unitQuestions[unit];
  }

  if (keywords && keywords.length > 0) {
    const keyword = keywords[0];
    // 代數相關
    if (keyword.includes('方程式')) return '方程式的解法與應用？';
    if (keyword.includes('不等式')) return '不等式的性質？';
    if (keyword.includes('函數')) return '函數的圖形與性質？';
    if (keyword.includes('因式')) return '因式分解的技巧？';
    if (keyword.includes('多項式')) return '多項式的運算？';

    // 幾何相關
    if (keyword.includes('三角形')) return '三角形的性質？';
    if (keyword.includes('圓')) return '圓的性質？';
    if (keyword.includes('相似')) return '相似形的判定？';
    if (keyword.includes('坐標')) return '坐標系統的應用？';
    if (keyword.includes('圖形')) return '幾何圖形的性質？';
    if (keyword.includes('展開')) return '展開圖的概念？';
    if (keyword.includes('平行')) return '平行線的性質？';
    if (keyword.includes('垂直')) return '垂直線的性質？';

    // 數與運算
    if (keyword.includes('負數')) return '負數運算的規則？';
    if (keyword.includes('分數')) return '分數運算的法則？';
    if (keyword.includes('根號') || keyword.includes('平方根')) return '根式的運算？';
    if (keyword.includes('次方')) return '指數的運算規則？';

    // 統計與機率
    if (keyword.includes('機率')) return '機率的計算？';
    if (keyword.includes('統計')) return '統計量的意義？';
    if (keyword.includes('平均')) return '平均數的計算？';

    // 數列
    if (keyword.includes('數列')) return '數列的規律？';
    if (keyword.includes('級數')) return '級數的求和？';
  }

  return '這題考的數學概念？';
}

/**
 * 生成概念說明的輔助函數（用於閃卡背面）
 */
function generateConceptExplanation(unit?: string, keywords?: string[]): string {
  if (unit) {
    const unitExplanations: { [key: string]: string } = {
      // 七年級
      '算式運算': '負數運算時，同號相加取同號，異號相減取絕對值較大數的符號。減去負數等於加上正數。',
      '整數的運算': '整數四則運算遵循先乘除後加減的規則，括號內的運算優先。',
      '分數的運算': '分數加減需通分，乘法直接乘，除法轉乘以倒數。',
      '立體圖形與展開圖': '展開圖是將立體圖形沿著某些邊剪開，攤平在平面上的圖形。可以幫助理解立體圖形的結構。',
      '生活中的立體圖形': '常見立體圖形包括柱體、錐體、球體，各有其體積與表面積公式。',
      '生活中的幾何': '基本幾何圖形包括點、線、面，以及角度、平行、垂直等關係。',
      '一元一次方程式': '解一元一次方程式的關鍵是將未知數移到等號一邊，常數移到另一邊。',
      '直角坐標與二元一次方程式的圖形': '坐標平面使用 (x, y) 表示點的位置，二元一次方程式的圖形為直線。',
      '比與比例式': '比例式中，內項乘積等於外項乘積。比值相等的兩個比可以組成比例式。',

      // 八年級
      '二元一次聯立方程式': '聯立方程式有兩種解法：代入消去法和加減消去法。目標是消去其中一個未知數。',
      '一元一次不等式': '不等式兩邊同乘或同除負數時，不等號方向要改變。',
      '乘法公式與多項式': '常用乘法公式包括 (a+b)² = a² + 2ab + b²、(a+b)(a-b) = a² - b²。',
      '因式分解': '因式分解是將多項式拆成若干因式相乘的形式，常用提公因式、十字交乘法。',
      '平方根與畢氏定理': '畢氏定理：直角三角形中，斜邊平方等於兩股平方和 (a² + b² = c²)。',
      '平行與四邊形': '平行四邊形的對邊相等且平行，對角相等，鄰角互補。',
      '三角形的基本性質': '三角形內角和為 180 度，任兩邊之和大於第三邊。',
      '線型函數': '線型函數的圖形為直線，斜率代表變化率，y 截距為直線與 y 軸的交點。',
      '統計': '常用統計量包括平均數、中位數、眾數，用來描述資料的集中趨勢。',

      // 九年級
      '一元二次方程式': '二次方程式可用因式分解、配方法或公式解求解。標準式為 ax² + bx + c = 0。',
      '二次函數': '二次函數圖形為拋物線，y = ax² + bx + c，a 決定開口方向，頂點為極值。',
      '相似形': '相似三角形的對應角相等，對應邊成比例。判定方法有 AAA、SAS、SSS。',
      '圓形': '圓的性質包括：圓心角是圓周角的兩倍、同弧上的圓周角相等。',
      '外心、內心與重心': '外心是三邊中垂線交點，內心是三角平分線交點，重心是三中線交點。',
      '機率': '機率 = 事件發生次數 ÷ 總次數，範圍在 0 到 1 之間。',
      '統計與機率': '統計用於整理資料，機率用於預測事件發生的可能性。',
      '數列與級數': '數列是有規律的數字序列，等差數列每項差值固定，等比數列每項比值固定。',
      '規律與數列': '數列的通項公式可以用來計算任意第 n 項的值。',
    };
    if (unitExplanations[unit]) return unitExplanations[unit];
  }

  if (keywords && keywords.length > 0) {
    const keyword = keywords[0];
    // 代數相關
    if (keyword.includes('方程式')) return '方程式是含有未知數的等式，解方程式就是找出使等式成立的未知數值。';
    if (keyword.includes('不等式')) return '不等式表示數量的大小關係，兩邊同乘除負數時，不等號方向要改變。';
    if (keyword.includes('函數')) return '函數描述兩個變數之間的對應關係，每個 x 值對應唯一的 y 值。';
    if (keyword.includes('因式')) return '因式分解是將多項式拆成因式相乘的形式，可簡化計算或求解方程式。';
    if (keyword.includes('多項式')) return '多項式是由若干項相加組成，每項包含係數和次方。';

    // 幾何相關
    if (keyword.includes('三角形')) return '三角形有三個邊和三個角，內角和為 180 度，類型包括銳角、直角、鈍角三角形。';
    if (keyword.includes('圓')) return '圓是平面上與圓心等距的點所形成的圖形，具有旋轉對稱性。';
    if (keyword.includes('相似')) return '相似圖形的形狀相同但大小可能不同，對應邊成比例，對應角相等。';
    if (keyword.includes('坐標')) return '坐標系統用數字 (x, y) 表示平面上點的位置，x 為橫坐標，y 為縱坐標。';
    if (keyword.includes('圖形')) return '幾何圖形有固定的性質和公式，例如面積、周長、體積等。';
    if (keyword.includes('展開')) return '展開圖是立體圖形攤平後的平面圖，可以幫助計算表面積和理解結構。';
    if (keyword.includes('平行')) return '平行線是在同一平面上永不相交的兩條直線，具有同位角相等等性質。';
    if (keyword.includes('垂直')) return '垂直是兩條直線相交成 90 度角，垂直線段最短。';

    // 數與運算
    if (keyword.includes('負數')) return '負數表示比零小的數。負數運算要注意符號：負負得正，正負得負。';
    if (keyword.includes('分數')) return '分數表示部分與整體的關係，運算時需注意通分和約分。';
    if (keyword.includes('根號') || keyword.includes('平方根')) return '平方根是平方後等於該數的值，根式運算需化簡為最簡根式。';
    if (keyword.includes('次方')) return '次方表示重複相乘，負數的奇數次方為負，偶數次方為正。';

    // 統計與機率
    if (keyword.includes('機率')) return '機率表示事件發生的可能性，數值在 0 到 1 之間，0 表示不可能，1 表示必然發生。';
    if (keyword.includes('統計')) return '統計量包括平均數、中位數、眾數，用於描述資料的特徵。';
    if (keyword.includes('平均')) return '平均數是所有數據的總和除以個數，可以代表資料的集中趨勢。';

    // 數列
    if (keyword.includes('數列')) return '數列是有規律排列的數字序列，可以找出通項公式來表示第 n 項。';
    if (keyword.includes('級數')) return '級數是數列各項的和，等差級數和等比級數各有求和公式。';
  }

  return '這是重要的數學概念，理解其定義和性質可以幫助解決相關問題。';
}

/**
 * 從題庫獲取隨機問題並轉換為觀念題
 */
async function getRandomExamQuestion(getRandomQuestion: () => any): Promise<FlashCardData> {
  const item = getRandomQuestion();
  if (!item) return { question: '無題目', answer: '無答案' };

  // 準備標準答案（用於 AI 分析）
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

      // 使用 AI 轉換的觀念問題和說明
      const finalQuestion =
        conceptData.data?.conceptQuestion ||
        conceptData.conceptQuestion ||
        generateSimpleQuestion(item.unit, item.keywords);

      const finalAnswer =
        conceptData.data?.conceptAnswer ||
        conceptData.conceptAnswer ||
        generateConceptExplanation(item.unit, item.keywords);

      return {
        question: finalQuestion,
        answer: finalAnswer,
      };
    }
  } catch (error) {
    console.error('AI 轉換失敗，使用備用觀念:', error);
  }

  // 如果 AI 轉換失敗，使用備用的觀念問答（而非原題目答案）
  return {
    question: generateSimpleQuestion(item.unit, item.keywords),
    answer: generateConceptExplanation(item.unit, item.keywords),
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
