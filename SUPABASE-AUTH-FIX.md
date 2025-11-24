# Supabase 認證問題修復指南

## 🚨 問題症狀
```
TypeError: Failed to fetch
認證 API 回應異常 (狀態: 556)
Unexpected token 'I', "Internal s"... is not valid JSON
```

## 🔍 根本原因
Supabase Auth 服務回傳 HTML 錯誤頁面而不是 JSON，表明專案配置或狀態有問題。

---

## 🔧 解決步驟

### 步驟 1：檢查 Supabase 專案狀態

1. **登入 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **進入你的專案**
   ```
   https://supabase.com/dashboard/project/nkvqozsoywrjokzzzgus
   ```

3. **檢查專案狀態**
   - 專案是否正常運行？
   - 是否有任何警告或錯誤訊息？
   - 是否因為閒置而被暫停？（免費版會暫停不活躍的專案）

4. **如果專案被暫停**
   - 點擊 "Resume Project" 或 "Restore Project"
   - 等待專案完全啟動（可能需要幾分鐘）

---

### 步驟 2：檢查 Authentication 配置

1. **進入 Authentication 設定**
   ```
   Dashboard → Authentication → Configuration
   ```

2. **檢查 Email Provider**
   - 點擊左側 "Providers"
   - 確認 "Email" 是啟用的（綠色）
   - 如果是停用的，點擊啟用

3. **檢查 Site URL**
   - 點擊 "URL Configuration"
   - Site URL 應該是: `http://localhost:3000`（開發環境）
   - Redirect URLs 應該包含: `http://localhost:3000/chat`

4. **Email 設定**
   - 點擊 "Email Templates"
   - 確認有預設的郵件模板
   - 開發環境可以暫時關閉 "Enable email confirmations"

---

### 步驟 3：驗證環境變數

確認 `.env.local` 中的配置是正確的：

```bash
# 檢查環境變數
cat .env.local | grep SUPABASE
```

應該有：
```env
NEXT_PUBLIC_SUPABASE_URL=https://nkvqozsoywrjokzzzgus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**:
- `NEXT_PUBLIC_SUPABASE_URL` 必須以 `NEXT_PUBLIC_` 開頭
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 必須使用 **anon key**，不是 service_role key

---

### 步驟 4：重新啟動開發伺服器

修改配置後，必須重啟：

```bash
# Ctrl+C 停止當前伺服器
# 然後重新啟動
npm run dev
```

---

### 步驟 5：測試連接

```bash
node test-supabase-auth.js
```

預期結果：
```
✅ Supabase 可訪問
✅ 認證 API 正常
✅ 匿名金鑰有效
✅ 登入 API 正常運作
```

---

## 🆘 替代方案

### 方案 A：使用測試模式（繞過認證）

如果 Supabase Auth 持續有問題，可以暫時使用測試模式：

1. **修改 `src/lib/supabase.ts`**（僅用於開發測試）

```typescript
// 添加測試模式
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

export const supabase = TEST_MODE
  ? createMockSupabase()
  : createClient(url, key);
```

2. **在 `.env.local` 啟用**
```env
NEXT_PUBLIC_TEST_MODE=true
```

### 方案 B：創建新的 Supabase 專案

如果當前專案無法修復：

1. 前往 https://supabase.com/dashboard
2. 點擊 "New Project"
3. 填寫資訊創建新專案
4. 複製新的 URL 和 Keys
5. 更新 `.env.local`

---

## 📊 診斷工具

### 快速診斷
```bash
# 測試認證
node test-supabase-auth.js

# 檢查用戶
node debug-analysis.js
```

### 手動測試認證 API
```bash
curl -X GET "https://nkvqozsoywrjokzzzgus.supabase.co/auth/v1/health"
```

應該返回 200 狀態碼。如果返回 5xx，表示 Auth 服務有問題。

---

## 🔐 安全檢查清單

- [ ] Supabase 專案正常運行
- [ ] Email Provider 已啟用
- [ ] Site URL 設定正確
- [ ] 環境變數使用正確的 Key
- [ ] Row Level Security (RLS) 政策設定正確
- [ ] 開發伺服器已重啟

---

## 💡 常見問題

### Q: 為什麼會收到 556 狀態碼？
A: 這通常表示 Supabase 內部服務錯誤，可能是專案被暫停或配置問題。

### Q: 需要設定 CORS 嗎？
A: 通常不需要，Supabase 預設允許 localhost。但可以在 Dashboard → Settings → API 檢查。

### Q: 免費版有什麼限制？
A:
- 專案閒置 7 天會自動暫停
- 每月 50MB 資料庫儲存
- 每月 500MB 檔案儲存
- 每月 2GB 頻寬

### Q: 測試時要真的發送驗證郵件嗎？
A: 開發環境可以在 Authentication → Settings 關閉 "Enable email confirmations"。

---

## 📞 需要更多幫助？

如果以上步驟都無法解決：

1. 提供 Supabase Dashboard 的截圖
2. 提供 `test-supabase-auth.js` 的完整輸出
3. 提供瀏覽器 Network tab 的錯誤詳情

我會協助進一步診斷！
