# AI Math Platform - 功能紀錄

## 專案簡介
AI Math Platform 是一個專注於數學學習的應用，結合 AI 技術，提供用戶多樣化的學習與測驗功能。以下是專案的功能模組與其詳細說明。

---

## 功能模組

### 1. **Analyze 分析模組**
- **功能**: 提供數據分析與結果儲存。
- **檔案**:
  - `analyzeMessages.ts`: 分析訊息的邏輯。
  - `extractUserMessages.ts`: 提取使用者訊息。
  - `saveAnalysisResults.ts`: 儲存分析結果。

---

### 2. **App 應用模組**
- **功能**: 定義應用的主要頁面與路由。
- **子模組與頁面**:
  - **首頁**:
    - `page.tsx`: 首頁。
  - **分析頁面**:
    - `analyze/page.tsx`: 分析頁面。
  - **API 路由**:
    - `api/analyze-results/route.ts`: 分析結果的 API 路由。
    - `api/gemini/route.ts`: Gemini 相關的 API 路由。
  - **聊天頁面**:
    - `chat/page.tsx`: 聊天頁面。
    - `chat/[id]/page.tsx`: 聊天詳細頁面。
  - **登入與註冊**:
    - `login/page.tsx`: 登入頁面。
    - `signup/page.tsx`: 註冊頁面。
  - **測驗頁面**:
    - `test/page.tsx`: 測驗頁面。

---

### 3. **Components 元件模組**
- **功能**: 提供可重複使用的 UI 元件。
- **子模組與元件**:
  - **分析元件**:
    - `AnalyzeResults.tsx`: 分析結果元件。
    - `ConceptChart.tsx`: 概念圖表元件。
    - `FeedbackList.tsx`: 回饋列表元件。
    - `GameDashboard.tsx`: 遊戲儀表板元件。
    - `LearningBadge.tsx`: 學習徽章元件。
    - `ProgressBar.tsx`: 進度條元件。
    - `UnstableChart.tsx`: 不穩定圖表元件。
  - **聊天元件**:
    - `Chat.tsx`: 聊天元件。
    - `ChatMain.tsx`: 聊天主頁元件。
    - `ChatSidebar.tsx`: 聊天側邊欄元件。
    - `ChatTopbar.tsx`: 聊天頂部欄元件。
  - **測驗元件**:
    - `AnswerArea.tsx`: 答案區域元件。
    - `QuestionCardSimple.tsx`: 簡單題目卡片元件。
    - 其他測驗相關元件。

---

### 4. **Hooks 自定義 Hook**
- **功能**: 提供共用邏輯的 React Hook。
- **檔案**:
  - `detectTopicFromGemini.ts`: 從 Gemini 偵測主題的邏輯。
  - `getTopicDetail.ts`: 獲取主題詳細資訊。
  - `useDebounce.ts`: 防抖 Hook。
  - `useMathAI.ts`: 數學 AI 相關的 Hook。

---

### 5. **Lib 工具模組**
- **功能**: 提供共用工具與資料。
- **檔案**:
  - `chatDeduplication.ts`: 聊天去重邏輯。
  - `chatHistory.ts`: 聊天歷史管理。
  - `conceptMapping.ts`: 概念映射邏輯。
  - `curriculum.json`: 課程資料。
  - `exam.json`: 考試資料。
  - `questionBank.ts`: 題庫邏輯。
  - **測驗資料**:
    - `test/batch_01_questions.json`: 測驗題目資料。

---

## 改進建議
1. **文件命名一致性**: 確保所有檔案的命名風格一致（例如駝峰式或底線分隔）。
2. **測試覆蓋率**: 增加單元測試，確保每個模組的穩定性。
3. **文件說明**: 在每個模組中添加 README 文件，簡要說明其功能。
4. **環境變數管理**: 使用 `.env` 文件集中管理敏感資訊。

---

此文件可作為專案的功能紀錄，方便日後查閱與維護。
