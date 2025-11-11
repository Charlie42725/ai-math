# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

AI Math Platform 是一個基於 Next.js 15 的數學學習平台，整合 Google Gemini AI 提供智能對話、練習測驗與學習分析功能。專案使用台灣國中數學課綱（七年級至九年級）作為知識架構。

## 常用指令

```bash
# 開發伺服器（使用 Turbopack）
npm run dev

# 生產環境建置
npm run build

# 啟動生產伺服器
npm start

# 執行 ESLint 檢查
npm run lint
```

## 核心架構

### 1. AI 整合架構

**中央 API 路由**: `/src/app/api/gemini/route.ts`
- 作為所有 Gemini API 呼叫的代理層
- 支援兩種模式：
  - **Vision Mode**: 處理圖片 + 文字（使用 gemini-pro-vision）
  - **Text Mode**: 多輪對話（使用 gemini-2.0-flash）
- 所有 AI 功能都通過此路由，避免重複的 API 配置

**分層 AI 編排模式**:
1. **基礎層**: `/api/gemini` 提供原始 AI 能力
2. **應用層**:
   - `useMathAI()` - 添加蘇格拉底式教學提示
   - `detectTopicFromGemini()` - 主題分類
   - `analyzeMessages()` - 學習模式分析
3. 每一層在基礎 AI 上添加特定領域邏輯

### 2. API 路由層

專案使用 Next.js App Router 的 Route Handlers，所有 API 端點位於 `/src/app/api/`：

**核心 API 端點**:
- `/api/gemini` - Gemini AI 代理層（詳見第 1 節）
- `/api/analyze-answer` - 評估學生答案正確性與回饋
- `/api/analyze-results/analyze` - 分析對話訊息並提取學習概念
- `/api/analyze-results` - 取得使用者的學習分析結果
- `/api/convert-to-concept` - 將文字轉換為課綱概念
- `/api/generate-flashcard` - 根據概念生成閃卡內容

**API 安全配置**:
- Gemini API 包含內容安全過濾（`HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_HATE_SPEECH`）
- 門檻設為 `BLOCK_MEDIUM_AND_ABOVE`
- 溫度參數設為 0.7，平衡創意與準確性

### 3. 資料持久化 (Supabase)

**配置**: `/src/lib/supabase.ts`
- Client-side: 使用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-side API: 使用 `SUPABASE_SERVICE_ROLE_KEY`

**資料表結構**:
- `chat_histories`: 儲存對話紀錄
  - `messages` 欄位為 JSONB 陣列，包含完整對話內容
  - 支援標題搜尋、日期分組
- `analyzed_attempts`: 儲存學習分析結果
  - 包含 `concepts_used[]`, `unstable_concepts[]`, `thinking_style`, `ai_feedback[]`

**聊天歷史管理** (`/src/lib/chatHistory.ts`):
- 提供完整的 CRUD 操作：save, fetch, update, rename, delete
- `groupChatsByDate()` 按「今天/昨天/更早」分組
- `searchChatHistories()` 支援標題全文搜尋

**去重機制** (`/src/lib/chatDeduplication.ts`):
- 解決並發創建對話時的競態條件
- `isDuplicateConversation()` 檢測重複
- `cleanupOldDuplicateRecords()` 清理舊記錄

### 4. 課綱驅動的題庫系統

**React Context 架構** (`/src/contexts/ExamContext.tsx`):
- `ExamProvider` 提供全域題庫存取
- 使用 `useMemo` 優化效能，避免重複載入 JSON
- 提供方法：`getQuestionById()`, `getQuestionsByGrade()`, `getQuestionsByUnit()`, `getRandomQuestion()`

### 5. 課綱驅動的題庫系統（靜態資料）

**靜態資料架構**:
- `/src/lib/curriculum.json`: 課綱結構（年級 → 單元 → 主題/關鍵字）
- `/src/lib/exam.json` + `/src/test/batch_01_questions.json`: 113+ 題測驗題目
- 題目包含 `grade`, `unit`, `keywords` 欄位，對應課綱結構

**題庫存取** (`/src/test/questionBank.ts`):
```typescript
// 關鍵函數
getRandomQuestions(count)           // 隨機選題
getQuestionsByGrade(grade, count)   // 按年級篩選
getQuestionsByUnit(unit, count)     // 按單元篩選
getQuestionsByKeywords(keywords)    // 按關鍵字篩選
```

**概念標準化** (`/src/lib/conceptMapping.ts`):
- `conceptMapping` 物件：將 100+ 個概念別名映射到標準課綱單元
- `standardizeConcept()`: 智能正規化函數
  - 處理拼寫變化、同義詞、相關術語
  - 使用正則表達式分類數學領域（幾何、代數、函數等）
  - 確保 AI 回傳的概念能對應到課綱

### 6. 測驗系統流程

**三階段狀態機** (`/src/components/test/PracticePageMinimal.tsx`):
1. **設定階段**: 選擇模式（隨機/按年級/按單元）與題數
2. **測驗階段**: 逐題作答，每題計時，可填寫解題過程
3. **結果階段**: 顯示分數與詳細分析

**答案提交流程**:
```
使用者提交答案
  → 檢查是否有預先分析資料
  → 若無：呼叫 /api/gemini 評估答案
  → 儲存：isCorrect, feedback, explanation, suggestions
  → 更新側邊欄顯示詳細分析
```

**分析側邊欄** (`/src/components/test/EnhancedAnalysisSidebar.tsx`):
- 即時顯示：回饋、解釋、思考過程、優化建議
- 可展開/收合各區塊
- 顯示使用者答案 vs 正確答案對比

### 7. 學習分析系統

**分析 API** (`/src/app/api/analyze-results/analyze/route.ts`):
- 輸入：`{ user_id, conversation_id, message_index, text }`
- 流程：
  1. 發送訊息到 Gemini，使用學習分析提示詞
  2. 解析回傳的 JSON
  3. 儲存到 `analyzed_attempts` 資料表
- 輸出結構：
  ```json
  {
    "concepts_used": ["概念1", "概念2"],
    "unstable_concepts": ["不穩定概念"],
    "thinking_style": "推理風格描述",
    "expression": "表達特點",
    "ai_feedback": ["建議1", "建議2"]
  }
  ```

**分析儀表板** (`/src/app/analyze/page.tsx`):
- 聚合顯示學習數據
- 使用 Recharts 視覺化概念掌握度
- 組件：`ConceptChart`, `UnstableChart`, `FeedbackList`, `ProgressBar`, `LearningBadge`

### 8. 聊天系統

**訊息格式**:
```typescript
interface Message {
  role: "user" | "assistant"
  parts: { text?: string, image?: string }[]
}
```
- 相容於 Gemini API 格式
- 支援文字與圖片混合

**對話流程**:
```
使用者輸入
  → /api/gemini 取得 AI 回應
  → 更新本地 messages 狀態
  → 儲存到 Supabase chat_histories
  → 更新側邊欄（含去重）
```

**組件分工**:
- `Chat.tsx`: 主控制器，處理認證與狀態管理
- `ChatSidebar.tsx`: 對話列表、搜尋、新增/刪除/重命名
- `ChatMain.tsx`: 訊息顯示區、輸入欄位、圖片上傳
- `ChatTopbar.tsx`: 頂部工具列

### 9. 抽卡系統（Gacha/Lottery）

**頁面**: `/src/app/draw/page.tsx`

**核心組件** (`/src/components/draw/`):
- `LotteryBox.tsx`: 主控制器，管理抽卡狀態機
  - 狀態：選擇禮包 → 拖曳/點擊開啟 → 爆炸特效 → 顯示獎品
  - 支援觸控與滑鼠拖曳（拖曳超過 150px 觸發開啟）
- `OrbitContainer.tsx`: 軌道動畫容器，禮包環繞中心旋轉
- `PrizeCard.tsx`: 獎品卡片翻轉動畫
- `ExplosionEffect.tsx`: 粒子爆炸特效
- `utils.ts`: 獎品機率計算與隨機選取

**樣式架構**:
- `drawStyles.css`: 基礎樣式與漸變背景
- `drawAnimations.css`: 關鍵幀動畫（軌道旋轉、卡片翻轉、粒子爆炸）
- `test-orbit.css`: 軌道測試樣式

**技術特點**:
- 使用 `useRef` 追蹤拖曳起始位置
- `useEffect` 動態綁定/解綁全域事件監聽器（`mousemove`, `touchmove`）
- 純 CSS 動畫實現軌道系統，無需額外動畫庫
- 狀態機模式確保開啟流程不會被重複觸發

## 重要架構決策

1. **靜態題庫載入**: 題目以 JSON 檔案形式載入，客戶端篩選。優點：快速篩選，不佔用資料庫資源。

2. **Gemini 2.0 Flash 模型**: 選擇快速模型避免配額耗盡，適合高頻率互動。

3. **客戶端分析側邊欄**: 保持測驗介面響應性，每題分析不需等待伺服器往返。

4. **課綱優先設計**: 所有題目標記課綱單元，支援學習路徑追蹤。

5. **去重層**: 處理聊天創建的競態條件，防止重複對話出現。

6. **概念映射抽象**: 標準化 AI 回應到課綱單元，處理同義詞與變體。

7. **Context 驅動的題庫**: 使用 React Context (`ExamProvider`) 提供全域題庫存取，避免 prop drilling。

8. **遊戲化學習**: 抽卡系統使用純 CSS 動畫與狀態機模式，提供流暢的互動體驗。

## 資料流程圖

### 聊天對話流程
```
使用者輸入
  → /api/gemini (呼叫 Gemini API)
  → 更新本地 messages 狀態
  → 儲存到 Supabase chat_histories
  → 取得歷史記錄（含去重）
  → 更新側邊欄顯示
```

### 測驗題目流程
```
選擇模式/年級/單元
  → questionBank.ts 從 exam.json 篩選
  → 載入題目到元件狀態
  → 逐題顯示
  → 使用者提交答案
  → /api/gemini 分析答案
  → 顯示分析側邊欄
  → 計算最終分數
```

### 學習分析流程
```
聊天訊息發送
  → /api/analyze-results/analyze 解析訊息
  → /api/gemini 提取概念/回饋
  → 儲存到 analyzed_attempts 資料表
  → /api/analyze-results 取得結果
  → 儀表板聚合與視覺化
```

### 抽卡流程
```
選擇禮包
  → 點擊或向上拖曳
  → 檢查拖曳距離 (>150px)
  → 觸發爆炸特效
  → utils.getRandomPrize() 隨機選獎
  → 顯示獎品卡片（翻轉動畫）
  → 重置按鈕返回初始狀態
```

## 認證系統

### 1. 電子郵件 / 密碼註冊與登入

**註冊功能** (`/src/components/auth/Signup.tsx`):
- 完整的密碼強度驗證（至少 8 字元、大小寫字母、數字）
- 即時密碼強度指示器（弱/中等/強）
- 密碼確認欄位防止輸入錯誤
- 檢測重複電子郵件註冊
- 支援郵件驗證流程
- 成功後自動跳轉到登入頁面

**登入功能** (`/src/components/auth/Login.tsx`):
- 使用 Supabase Auth 的 `signInWithPassword`
- 錯誤處理和使用者回饋
- 登入成功後跳轉到 `/chat` 頁面

### 2. OAuth 第三方登入

專案支援三種 OAuth 提供商：
- **Google** - 使用 `google` provider
- **Microsoft (Azure AD)** - 使用 `azure` provider
- **Apple** - 使用 `apple` provider

**實作方式**:
- 使用 Supabase 的 `signInWithOAuth` API
- 自動重新導向到 `/chat` 頁面
- 統一的錯誤處理機制

**設定步驟**:
詳細的 OAuth 設定指南請參閱 `OAUTH_SETUP.md` 檔案，包含：
1. Google Cloud Console 設定
2. Azure AD 應用程式註冊
3. Apple Developer 設定
4. Supabase Provider 配置

## 環境變數

必要的環境變數（在 `.env.local` 中設定）：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

**注意**: OAuth 憑證直接在 Supabase Dashboard 中設定，不需要在環境變數中配置。

## 技術棧

- **框架**: Next.js 15.4.5 (App Router)
- **UI 函式庫**: React 19.1.0
- **樣式**: Tailwind CSS 4 + 自定義 CSS 動畫
- **資料庫**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **圖表**: Recharts 3.1.2
- **語言**: TypeScript 5

## 開發注意事項

1. **Gemini API 呼叫**: 所有 AI 功能必須通過 `/api/gemini` 路由，不要直接呼叫 Gemini API。

2. **題目篩選**: 使用 `questionBank.ts` 的函數篩選題目，確保與課綱結構一致。

3. **概念正規化**: 使用 `standardizeConcept()` 將 AI 回傳的概念對應到課綱單元。

4. **聊天歷史更新**: 使用 `chatHistory.ts` 的函數操作對話記錄，會自動處理去重。

5. **認證狀態**: 聊天與分析功能需要使用者登入，使用 Supabase Auth 檢查。

6. **Debouncing**: 側邊欄重新整理使用 300ms 防抖，平衡響應性與效能。

7. **事件監聽器清理**: 使用 `useEffect` 返回清理函數，避免記憶體洩漏（例如抽卡系統的拖曳事件）。

8. **狀態機模式**: 抽卡與測驗系統使用明確的狀態轉換，防止非法操作（例如重複開啟禮包）。
