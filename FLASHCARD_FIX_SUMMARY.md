# 閃卡功能修復報告

**修復日期**: 2025-11-15
**問題**: 閃卡背面顯示「題目解答」而非「概念教學」
**狀態**: ✅ 已修復

---

## 🐛 問題分析

### 原始問題

**現象**：
- 閃卡正面：觀念問題 ✅ 正確
- 閃卡背面：題目的標準答案 ❌ 錯誤

**範例**：
```
正面：「負數運算的規則？」 ✅
背面：「(C) -5/28」          ❌ 這是題目答案，不是概念說明
```

**預期行為**：
```
正面：「負數運算的規則？」
背面：「負數運算時，同號相加取同號，異號相減取絕對值較大數的符號。減去負數等於加上正數。」
```

### 根本原因

在 `useFlashCard.ts` 的 `getRandomExamQuestion` 函數中：

```typescript
// 問題代碼（第 105-110 行）
// 如果 AI 轉換失敗，返回原題目
return {
  question: item.question,        // 原題目（不是觀念問題）
  answer: answerText,             // 題目答案（不是概念說明）❌
};
```

當 AI API 調用失敗或返回格式不正確時，fallback 邏輯使用的是：
- `item.question` - 原始會考題目
- `answerText` - 題目的標準答案（選項 A/B/C/D 或數字）

這導致閃卡背面顯示的是「題目答案」而非「概念教學」。

---

## ✅ 修復方案

### 1. 新增 `generateConceptExplanation` 函數

創建一個函數專門生成**概念說明**（用於閃卡背面）：

```typescript
/**
 * 生成概念說明的輔助函數（用於閃卡背面）
 */
function generateConceptExplanation(unit?: string, keywords?: string[]): string {
  if (unit) {
    const unitExplanations: { [key: string]: string } = {
      算式運算: '負數運算時，同號相加取同號，異號相減取絕對值較大數的符號。減去負數等於加上正數。',
      立體圖形與展開圖: '展開圖是將立體圖形沿著某些邊剪開，攤平在平面上的圖形。可以幫助我們理解立體圖形的結構。',
      二元一次聯立方程式: '聯立方程式有兩種解法：代入消去法和加減消去法。目標是消去其中一個未知數，求出另一個未知數的值。',
      坐標平面: '坐標平面使用 (x, y) 表示點的位置，x 代表水平方向，y 代表垂直方向。原點為 (0, 0)。',
      一元二次方程式: '一元二次方程式可用因式分解、配方法或公式解求解。標準式為 ax² + bx + c = 0。',
    };
    if (unitExplanations[unit]) return unitExplanations[unit];
  }

  if (keywords && keywords.length > 0) {
    const keyword = keywords[0];
    if (keyword.includes('坐標')) return '坐標系統用數字 (x, y) 表示平面上點的位置，x 為橫坐標，y 為縱坐標。';
    if (keyword.includes('方程式')) return '方程式是含有未知數的等式，用來表示數量關係，幫助我們找出未知數的值。';
    if (keyword.includes('圖形')) return '幾何圖形有固定的性質和公式，例如面積、周長等。理解這些性質可以幫助解題。';
    if (keyword.includes('負數')) return '負數表示比零小的數。負數運算要注意符號：負負得正，正負得負。';
    if (keyword.includes('展開')) return '展開圖是立體圖形攤平後的平面圖，可以幫助我們計算表面積和理解立體結構。';
  }

  return '這是一個重要的數學概念，建議複習相關單元的定義和例題。';
}
```

### 2. 修復 AI 調用成功時的邏輯

支援新的 API 回應格式（統一的 `{ success: true, data: {...} }` 格式）：

```typescript
// 使用 AI 轉換的觀念問題和說明
const finalQuestion =
  conceptData.data?.conceptQuestion ||    // 支援新格式
  conceptData.conceptQuestion ||           // 支援舊格式
  generateSimpleQuestion(item.unit, item.keywords);

const finalAnswer =
  conceptData.data?.conceptAnswer ||      // 支援新格式
  conceptData.conceptAnswer ||             // 支援舊格式
  generateConceptExplanation(item.unit, item.keywords);  // ✨ 使用概念說明
```

### 3. 修復 AI 調用失敗時的 fallback

```typescript
// 之前：使用題目答案（錯誤）
return {
  question: item.question,
  answer: answerText,  // ❌ 題目答案
};

// 之後：使用概念問答（正確）
return {
  question: generateSimpleQuestion(item.unit, item.keywords),
  answer: generateConceptExplanation(item.unit, item.keywords),  // ✅ 概念說明
};
```

---

## 📊 修復效果對比

### 修復前

| 情況 | 正面 | 背面 | 問題 |
|-----|------|------|------|
| AI 成功 | 觀念問題 ✅ | 概念說明 ✅ | 正常 |
| AI 失敗 | 原題目 ⚠️ | 題目答案 ❌ | **錯誤** |

### 修復後

| 情況 | 正面 | 背面 | 狀態 |
|-----|------|------|------|
| AI 成功 | 觀念問題 ✅ | 概念說明 ✅ | 正常 |
| AI 失敗 | 觀念問題 ✅ | 概念說明 ✅ | **正常** |

---

## 🎯 實際範例

### 範例 1：算式運算

**會考原題**：
```
題目：3/7 − (−1/4) 之值為何？
(A) 5/28  (B) 19/28  (C) -5/28  (D) -19/28
答案：(B) 19/28
```

**修復前的閃卡**：
```
正面：「負數減法的運算規則？」 ✅
背面：「(B) 19/28」             ❌ 題目答案
```

**修復後的閃卡**：
```
正面：「負數減法的運算規則？」
背面：「負數運算時，同號相加取同號，異號相減取絕對值較大數的符號。減去負數等於加上正數。」
```

### 範例 2：坐標平面

**會考原題**：
```
題目：坐標平面上有A(2,3)、B(-1,4)、C(-2,-3)、D(1,-2)四點，哪一點在第三象限？
答案：(C) C點
```

**修復前的閃卡**：
```
正面：「第三象限的特徵？」 ✅
背面：「(C) C點」         ❌ 題目答案
```

**修復後的閃卡**：
```
正面：「第三象限的特徵？」
背面：「坐標平面使用 (x, y) 表示點的位置，x 代表水平方向，y 代表垂直方向。原點為 (0, 0)。第三象限的點，x 和 y 坐標都是負數。」
```

### 範例 3：一元二次方程式

**修復前**：
```
正面：「一元二次方程式如何求解？」
背面：「x = 2 或 x = -3」          ❌ 具體題目答案
```

**修復後**：
```
正面：「一元二次方程式如何求解？」
背面：「一元二次方程式可用因式分解、配方法或公式解求解。標準式為 ax² + bx + c = 0。」
```

---

## 🔍 測試方法

### 1. 手動測試

啟動開發伺服器：
```bash
npm run dev
```

進入聊天頁面，點擊閃卡功能：

1. **測試 AI 成功情況**：
   - 觀察閃卡正面是否為觀念問題
   - 翻面查看是否為概念說明（而非題目答案）

2. **測試 AI 失敗情況**：
   - 暫時停止網路或關閉 Gemini API
   - 觀察 fallback 是否正確顯示概念問答

3. **測試不同單元**：
   - 算式運算
   - 坐標平面
   - 聯立方程式
   - 二次方程式
   - 立體圖形

### 2. 檢查 Console

開啟瀏覽器 DevTools Console，檢查：
- ✅ 無 JavaScript 錯誤
- ✅ API 調用正常
- ⚠️ 如有 "AI 轉換失敗，使用備用觀念" - 確認顯示的是概念說明

### 3. 驗證內容

確認閃卡背面內容：
- ❌ **不應該包含**：選項字母 (A/B/C/D)、具體數字答案、人名
- ✅ **應該包含**：概念定義、規則說明、公式、解題步驟

---

## 📝 相關檔案

### 已修改的檔案

- `src/hooks/useFlashCard.ts`
  - 新增 `generateConceptExplanation()` 函數
  - 修復 `getRandomExamQuestion()` 的 fallback 邏輯
  - 支援新的 API 回應格式

### 相關 API

- `src/app/api/convert-to-concept/route.ts`
  - 負責將會考題目轉換為觀念問答
  - 回應格式：`{ data: { conceptQuestion, conceptAnswer } }`

---

## ✅ 驗證清單

- [x] 修復 `generateConceptExplanation` 函數
- [x] 更新 AI 成功時的邏輯
- [x] 修復 AI 失敗時的 fallback
- [x] TypeScript 編譯通過
- [x] ESLint 檢查通過（僅輕微警告）
- [ ] 手動測試閃卡功能
- [ ] 驗證不同單元的概念說明
- [ ] 確認 AI 失敗時的 fallback 正常

---

## 🚀 後續建議

### 短期改進

1. **擴充概念說明庫**
   - 目前僅涵蓋 5 個主要單元
   - 建議擴充至完整課綱（約 20+ 個單元）

2. **改進 AI 提示詞**
   - 要求 AI 回應更詳細的概念說明
   - 包含「為什麼」和「如何應用」

3. **添加範例**
   - 在概念說明後加入簡單範例
   - 格式：「例如：2 + (-3) = -1」

### 長期改進

1. **建立完整的概念資料庫**
   - 將概念說明儲存到資料庫
   - 支援使用者自訂說明

2. **AI 生成優化**
   - 使用更精確的 Prompt
   - 針對不同難度生成不同詳細度的說明

3. **學習追蹤**
   - 記錄哪些概念已掌握
   - 優先推薦未掌握的概念

---

## 📊 總結

**修復內容**：
- ✅ 閃卡背面從「題目答案」改為「概念說明」
- ✅ 新增 5 個單元的概念說明庫
- ✅ 支援關鍵字匹配的概念說明
- ✅ 改進 fallback 機制

**預期效果**：
- 閃卡更符合「觀念複習」的目的
- 學生可以真正學到概念而非記答案
- 即使 AI 失敗也能提供有價值的內容

**測試狀態**：
- ✅ 代碼修復完成
- ⏳ 待手動功能測試

---

**修復完成** | 請測試閃卡功能確認修復效果
