# 🚀 快速開始指南

## ✅ 已修復的功能

所有頁面現在都支持開發模式，可以繞過 Supabase Auth 直接使用！

### 修復列表

✅ **登入頁面** - `/login`
- 輸入任意帳號密碼即可登入
- 顯示黃色開發模式提示

✅ **註冊頁面** - `/signup`
- 輸入任意帳號密碼即可註冊
- 自動登入並跳轉到聊天頁面

✅ **聊天頁面** - `/chat`
- 自動使用管理員帳號
- 可以建立新對話
- 查看歷史對話

✅ **對話詳情** - `/chat/[id]`
- 直接載入對話內容
- 無需認證檢查

✅ **AI 分析頁面** - `/analyze`
- 直接使用管理員 ID
- 可以觸發分析
- 查看分析結果

✅ **做題練習** - `/test`
- 無需登入即可使用

---

## 🎯 立即測試

### 1. 啟動開發伺服器

```bash
npm run dev
```

### 2. 測試登入

訪問 http://localhost:3000/login

```
Email: test@example.com
密碼: 123456
```

點擊登入 → 應該看到"登入成功（開發模式）！正在跳轉..."

### 3. 測試聊天

訪問 http://localhost:3000/chat

應該能夠：
- ✅ 看到側邊欄
- ✅ 看到「開始新對話」按鈕
- ✅ 輸入訊息並發送
- ✅ 收到 AI 回覆

### 4. 測試 AI 分析

訪問 http://localhost:3000/analyze

應該能夠：
- ✅ 看到「開始 AI 分析」按鈕
- ✅ 點擊後開始分析
- ✅ 查看分析結果

---

## 🔧 環境變數確認

確認 `.env.local` 包含：

```env
# Gemini API
GEMINI_API_KEY=AIzaSyBWt0JI9i0KP8VCuuQDzc0E-8B4-5PRHzQ

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nkvqozsoywrjokzzzgus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 開發模式（重要！）
NEXT_PUBLIC_DEV_AUTH=true
```

---

## 📋 功能清單

| 功能 | 路徑 | 狀態 | 說明 |
|------|------|------|------|
| 登入 | `/login` | ✅ | 任意帳號密碼 |
| 註冊 | `/signup` | ✅ | 任意帳號密碼 |
| 聊天 | `/chat` | ✅ | 管理員模式 |
| 對話詳情 | `/chat/[id]` | ✅ | 管理員模式 |
| AI 分析 | `/analyze` | ✅ | 管理員模式 |
| 做題練習 | `/test` | ✅ | 無需登入 |
| 首頁 | `/` | ✅ | 無需登入 |

---

## 🐛 如果還是有問題

### 檢查清單

1. **確認環境變數**
```bash
cat .env.local | grep NEXT_PUBLIC_DEV_AUTH
# 應該顯示: NEXT_PUBLIC_DEV_AUTH=true
```

2. **重啟開發伺服器**
```bash
# Ctrl+C 停止當前伺服器
npm run dev
```

3. **清除瀏覽器快取**
- 按 F12 打開開發者工具
- 右鍵點擊重新整理按鈕
- 選擇「清除快取並強制重新整理」

4. **檢查控制台錯誤**
- 按 F12 打開控制台
- 查看是否有紅色錯誤訊息

### 常見問題

**Q: 登入後顯示"未登入"**
```bash
# 確認環境變數
cat .env.local | grep DEV_AUTH
# 重啟伺服器
npm run dev
```

**Q: 聊天功能無法使用**
- 檢查 Gemini API Key 是否有效
- 查看控制台是否有 API 錯誤
- 確認網路連線正常

**Q: AI 分析顯示錯誤**
- 檢查後端終端的錯誤訊息
- 確認 Supabase 資料庫可以訪問
- 查看 Gemini API 配額是否用完

---

## 🌐 部署到生產環境

### Vercel 部署

1. **推送到 GitHub**
```bash
git add .
git commit -m "Add dev mode"
git push
```

2. **連接 Vercel**
- 訪問 https://vercel.com
- Import GitHub 倉庫
- 自動部署

3. **設定環境變數**
```
Dashboard → Settings → Environment Variables
```

添加：
```
NEXT_PUBLIC_DEV_AUTH = true
GEMINI_API_KEY = <你的 API Key>
NEXT_PUBLIC_SUPABASE_URL = <你的 Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <你的 Anon Key>
SUPABASE_SERVICE_ROLE_KEY = <你的 Service Role Key>
```

4. **重新部署**
```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

---

## 💡 使用提示

### 管理員帳號資訊

```
用戶 ID: 7b576435-bd20-4f05-b4c1-b21394870dfd
Email: admin@aimath.com
名稱: 管理員
```

### 測試流程

1. **登入** → 輸入任意帳號密碼
2. **聊天** → 輸入數學問題，例如「老師，我不會算一元二次方程式」
3. **分析** → 進行幾次對話後，訪問 /analyze 查看分析結果
4. **做題** → 訪問 /test 練習數學題目

### 開發建議

- 開發時保持 `NEXT_PUBLIC_DEV_AUTH=true`
- 測試真實 Auth 功能時改為 `false`
- 部署到生產環境前評估安全風險
- 考慮添加 IP 白名單或簡單密碼保護

---

## 📞 需要幫助？

如果遇到任何問題：

1. 查看終端的錯誤訊息
2. 查看瀏覽器控制台的錯誤
3. 確認環境變數設定正確
4. 重啟開發伺服器
5. 清除瀏覽器快取

祝你使用愉快！🎉
