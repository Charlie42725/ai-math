/**
 * AI Prompts 統一管理
 * 集中管理所有 AI 提示詞，便於維護和更新
 */

/**
 * 蘇格拉底式數學教學提示詞
 */
export const MATH_TEACHER_PRIMER = `
背景（Context）：

你現在是一位國中數學老師，我是一位國中生，正在學習數學。

目標（Objective）：
請引導我理解數學概念，並透過 Socratic 問答引導我一步步解題。

風格（Style）：
教學式、清楚易懂、步驟明確。

語氣（Tone）：
鼓勵、親切，就像溫暖的補習老師。

受眾（Audience）：
我是一位對數學有點卡關的學生。

回應（Response）：
請用「引導式問答」格式，例如：
- 第一步：你可以先觀察什麼？
- 第二步：根據這個資訊，你會怎麼判斷？
- 第三步：試著自己列出一步步的解題邏輯

請避免過度使用粗體標記，保持文字簡潔易讀。
`.trim();

/**
 * 數學教師初始回應
 */
export const MATH_TEACHER_INITIAL_RESPONSE =
  '我明白了，我會以溫暖的數學老師身份，用引導式問答來幫助你學習數學。請告訴我你的數學問題吧！';

/**
 * 允許的數學概念清單
 */
export const ALLOWED_MATH_CONCEPTS = [
  '整數運算',
  '分數運算',
  '有理數',
  '一元一次方程式',
  '二元聯立方程式',
  '一元二次方程式',
  '乘法公式',
  '多項式',
  '因式分解',
  '平方根',
  '畢氏定理',
  '線性函數',
  '二次函數',
  '坐標平面',
  '三角形性質',
  '平行四邊形',
  '相似形',
  '圓',
  '立體圖形',
  '幾何計算',
  '統計',
  '機率',
  '比例',
  '不等式',
] as const;

/**
 * 題目分析提示詞
 */
export interface AnalyzeAnswerParams {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  userProcess: string;
}

export function createAnalyzeAnswerPrompt(params: AnalyzeAnswerParams): string {
  const isCorrect = params.userAnswer === params.correctAnswer;

  return `你是一位專業的國中數學老師，請對學生的答題進行詳細分析。

**題目資訊：**
題目：${params.question}

選項：
A: ${params.options.A}
B: ${params.options.B}
C: ${params.options.C}
D: ${params.options.D}

**學生作答：**
學生的答案：${params.userAnswer}
學生的解題過程：${params.userProcess || '學生未提供解題過程'}

**正確資訊：**
正確答案：${params.correctAnswer}
標準解析：${params.explanation}

**答題結果：** ${isCorrect ? '✓ 答案正確' : '✗ 答案錯誤'}

---

請以 JSON 格式提供完整分析，**必須包含所有欄位且內容豐富**：

{
  "feedback": "${isCorrect ? '答案正確！' : '答案錯誤'}",
  "explanation": "用1-2句話說明正確答案和原因",
  "detailedAnalysis": "用3-5句話詳細分析這道題的解題方法、關鍵概念和常見錯誤",
  "thinkingProcess": "${params.userProcess ? '評估學生的解題邏輯和思考方式（2-3句話）' : '學生未提供解題過程，建議學生養成寫下解題步驟的習慣'}",
  "thinkingScore": ${params.userProcess ? '根據解題過程給予1-5分的評分' : '2'},
  "optimization": "給學生2-3句話的具體改進建議",
  "suggestions": [
    "第一個學習建議（具體且可執行）",
    "第二個學習建議（具體且可執行）",
    "第三個學習建議（具體且可執行）"
  ],
  "stepByStepSolution": [
    {
      "step": 1,
      "title": "理解題意",
      "content": "說明這道題在問什麼、給了什麼條件（2-3句話）"
    },
    {
      "step": 2,
      "title": "選擇解法",
      "content": "說明應該用什麼方法解這道題、為什麼（2-3句話）"
    },
    {
      "step": 3,
      "title": "計算過程",
      "content": "詳細的計算步驟和推理過程（3-4句話）"
    },
    {
      "step": 4,
      "title": "驗證答案",
      "content": "如何確認答案是正確的（1-2句話）"
    }
  ],
  "keyPoints": [
    "這道題的第一個關鍵概念",
    "這道題的第二個關鍵概念",
    "這道題的第三個關鍵概念"
  ]
}

**重要提示：**
1. 請確保每個欄位都有完整內容，不要留空
2. stepByStepSolution 必須包含 3-4 個步驟
3. keyPoints 必須包含 2-3 個關鍵概念
4. suggestions 必須包含 3 個具體建議
5. 所有文字內容要詳細且實用，避免空泛
6. 回答必須是純 JSON 格式，不要有其他文字`.trim();
}

/**
 * 學習分析提示詞
 */
export function createLearningAnalysisPrompt(context: string): string {
  return `你是國中數學學習專家，只分析數學相關內容。

【嚴格規則】
1. 只回傳純 JSON，無其他文字
2. 只能使用下列數學概念，絕不使用其他學科
3. 如果不是數學相關，回傳空陣列

允許的數學概念清單：
${ALLOWED_MATH_CONCEPTS.map((c) => `- ${c}`).join('\n')}

【禁止】絕對不能出現：生物、化學、物理、歷史、地理等非數學概念

對話內容：${context}

回傳格式：
{
  "concepts_used": ["僅限上述數學概念"],
  "unstable_concepts": ["僅限上述數學概念"],
  "thinking_style": "邏輯型/視覺型/操作型/未知",
  "expression": "清楚/模糊/簡潔",
  "ai_feedback": ["數學學習建議"],
  "confidence": 0.8
}`.trim();
}

/**
 * 閃卡生成提示詞
 */
export interface FlashcardParams {
  concept: string;
  grade?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function createFlashcardPrompt(params: FlashcardParams): string {
  const difficultyText = params.difficulty
    ? `難度：${params.difficulty === 'easy' ? '簡單' : params.difficulty === 'medium' ? '中等' : '困難'}`
    : '';
  const gradeText = params.grade ? `年級：${params.grade}` : '';

  return `
請為以下數學概念生成一張學習閃卡：

概念：${params.concept}
${gradeText}
${difficultyText}

請以 JSON 格式回答：
{
  "front": "閃卡正面內容（問題或關鍵概念）",
  "back": "閃卡背面內容（答案或詳細說明）",
  "example": "實際範例",
  "tips": ["學習提示1", "學習提示2"],
  "relatedConcepts": ["相關概念1", "相關概念2"]
}

要求：
- 內容適合國中生程度
- 使用清晰易懂的語言
- 提供實用的學習提示
`.trim();
}

/**
 * 概念轉換提示詞
 */
export function createConceptConversionPrompt(text: string): string {
  return `
請將以下文字轉換為標準的數學課綱概念。

文字：${text}

允許的概念清單：
${ALLOWED_MATH_CONCEPTS.map((c) => `- ${c}`).join('\n')}

請以 JSON 格式回答：
{
  "concepts": ["標準概念1", "標準概念2"],
  "confidence": 0.9
}

注意：
- 只回傳上述清單中的概念
- 如果無法對應，回傳空陣列
- confidence 為 0-1 之間的信心度
`.trim();
}

/**
 * 快速分析版本 - 優化速度和準確性
 */
export function createAnalyzeAnswerPromptFast(params: AnalyzeAnswerParams): string {
  const isCorrect = params.userAnswer === params.correctAnswer;

  return `你是數學老師。請仔細檢查學生的每一個計算步驟。

題目：${params.question}
選項：A:${params.options.A} B:${params.options.B} C:${params.options.C} D:${params.options.D}
正確答案：${params.correctAnswer}
學生答案：${params.userAnswer}
${params.userProcess ? `\n學生寫的過程：\n${params.userProcess}` : '學生沒寫過程'}

【分析步驟】
1. 先逐步驗證學生寫的每個計算是否正確
2. 找出第一個出錯的地方
3. 判斷是概念錯誤還是計算粗心

【評分標準】
5分：過程和答案都對
4分：每步計算都對，但最後答案抄錯或算錯（粗心）
3分：有思路但計算方法錯
2分：過程不完整
1分：沒過程或全錯

JSON格式：
{
  "feedback": "${isCorrect ? '答案正確！' : '答案錯誤'}",
  "explanation": "${isCorrect ? '解釋為何正確' : '明確指出：哪一步算錯了？錯的值是什麼？正確應該是什麼？'}",
  "detailedAnalysis": "這題考什麼？學生${isCorrect ? '掌握得很好' : '在第幾步出錯？'}",
  "thinkingProcess": "${params.userProcess ? '學生的思路/方法對不對？如果方法對但算錯，明確說是計算失誤' : '沒提供過程'}",
  "thinkingScore": ${params.userProcess ? '嚴格按評分標準（方法對但算錯=4分）' : '1'},
  "optimization": "改進建議",
  "suggestions": ["建議1", "建議2"],
  "stepByStepSolution": [
    {"step": 1, "title": "步驟標題", "content": "做法"},
    {"step": 2, "title": "步驟標題", "content": "做法"}
  ],
  "keyPoints": ["重點1", "重點2"]
}

【重要】
- stepByStepSolution和keyPoints必須有內容
- 答案錯時，必須明確指出錯在第幾步、算錯了什麼
- 如果學生方法對但算錯數字，一定要給4分，不是3分！`.trim();
}

/**
 * Prompt 模板類型
 */
export const PromptTemplates = {
  mathTeacher: {
    primer: MATH_TEACHER_PRIMER,
    initialResponse: MATH_TEACHER_INITIAL_RESPONSE,
  },
  analyzeAnswer: createAnalyzeAnswerPrompt,
  analyzeAnswerFast: createAnalyzeAnswerPromptFast,
  learningAnalysis: createLearningAnalysisPrompt,
  flashcard: createFlashcardPrompt,
  conceptConversion: createConceptConversionPrompt,
} as const;
