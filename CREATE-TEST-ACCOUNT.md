# 創建測試帳號指南

## 🚀 快速創建測試帳號

### 方法 1：通過網頁註冊（推薦）

1. 啟動開發伺服器
```bash
npm run dev
```

2. 訪問註冊頁面
```
http://localhost:3000/signup
```

3. 填寫測試帳號資訊
```
Email: test@example.com
密碼: Test123456
```

4. 註冊成功後會自動跳轉到聊天頁面

### 方法 2：使用 Supabase Dashboard

1. 登入你的 Supabase Dashboard
```
https://supabase.com/dashboard
```

2. 進入你的專案
```
https://supabase.com/dashboard/project/nkvqozsoywrjokzzzgus
```

3. 點選左側 `Authentication` → `Users`

4. 點擊 `Add user` → `Create new user`

5. 填寫資訊：
```
Email: test@example.com
Password: Test123456
```

6. 點擊 `Create user`

## 📝 現有用戶

根據資料庫記錄，你已經有以下用戶：

```
用戶 ID: 7b576435-bd20-4f05-b4c1-b21394870dfd
- 有對話記錄
- 有分析結果
- 可以直接使用
```

## 🧪 測試流程

### 1. 登入測試帳號
訪問: http://localhost:3000/login

### 2. 開始聊天對話
- 點擊「開始新對話」
- 輸入數學問題，例如：
  ```
  老師，我不太會算一元二次方程式
  ```

### 3. 查看 AI 分析
訪問: http://localhost:3000/analyze
點擊「開始 AI 分析」

## 🔐 推薦的測試帳號格式

為了方便測試，建議創建：

```
Email: test1@example.com
密碼: Test123456

Email: test2@example.com
密碼: Test123456

Email: demo@example.com
密碼: Demo123456
```

## ⚠️ 注意事項

1. **測試環境專用**
   - 這些帳號只用於開發測試
   - 不要在生產環境使用這些密碼

2. **Email 驗證**
   - Supabase 預設需要驗證 email
   - 在開發環境可以在 Dashboard 手動確認用戶

3. **權限檢查**
   - 確保 RLS (Row Level Security) 政策設定正確
   - 測試帳號應該能讀寫自己的資料

## 🐛 如果無法註冊

檢查以下設定：

1. **Supabase Authentication 設定**
```
Dashboard → Authentication → Settings
- Enable Email provider
- Disable email confirmation (開發環境)
```

2. **環境變數**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://nkvqozsoywrjokzzzgus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的 anon key>
```

3. **RLS 政策**
```sql
-- 允許用戶讀取自己的資料
CREATE POLICY "Users can read own data"
ON chat_histories
FOR SELECT
USING (auth.uid() = user_id);

-- 允許用戶寫入自己的資料
CREATE POLICY "Users can insert own data"
ON chat_histories
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 📊 驗證帳號是否正常

運行檢查腳本：
```bash
node check-users.js
```

應該會看到你新建的測試帳號。
