# 開發模式使用指南

## 🎯 什麼是開發模式？

由於 Supabase Auth 服務異常，我們創建了**開發模式**來繞過認證系統，直接使用管理員帳號。

---

## ⚙️ 啟用開發模式

已在 `.env.local` 中啟用：

```env
NEXT_PUBLIC_DEV_AUTH=true
```

---

## 🔑 管理員帳號

開發模式使用現有的管理員用戶：

```
用戶 ID: 7b576435-bd20-4f05-b4c1-b21394870dfd
Email: admin@aimath.com
名稱: 管理員
```

---

## 🚀 使用方式

### 1. 啟動開發伺服器

```bash
npm run dev
```

### 2. 訪問登入頁面

```
http://localhost:3000/login
```

### 3. 輸入任意帳號密碼

開發模式下，輸入**任何 email 和密碼**都可以成功登入：

```
Email: test@example.com （任意值都可以）
密碼: 123456 （任意值都可以）
```

系統會顯示黃色提示框告訴你目前是開發模式。

### 4. 登入後自動使用管理員帳號

登入成功後，系統會：
- 使用管理員用戶 ID
- 可以正常使用所有功能
- 可以查看管理員的對話記錄
- 可以進行 AI 分析

---

## 📱 功能清單

開發模式下，所有功能都正常運作：

✅ **聊天功能** - http://localhost:3000/chat
- 建立新對話
- 查看歷史對話
- 所有對話都儲存在管理員帳號下

✅ **AI 分析** - http://localhost:3000/analyze
- 查看分析結果
- 觸發新的分析
- 查看學習統計

✅ **做題練習** - http://localhost:3000/test
- 練習數學題目
- 查看答題記錄

---

## 🌐 部署到生產環境

開發模式在部署後**仍然可用**！

### Vercel 部署

1. **設定環境變數**
   ```
   Dashboard → Settings → Environment Variables
   ```

2. **添加開發模式變數**
   ```
   NEXT_PUBLIC_DEV_AUTH = true
   ```

3. **重新部署**
   ```bash
   git push
   ```

4. **訪問你的網站**
   ```
   https://your-app.vercel.app/login
   ```
   輸入任意帳號密碼即可登入！

### 其他平台（Netlify, Railway 等）

同樣在環境變數中設定：
```
NEXT_PUBLIC_DEV_AUTH=true
```

---

## 🔒 安全注意事項

### ⚠️ 開發模式風險

開發模式**跳過了所有認證檢查**，任何人都可以登入！

### 🛡️ 建議的安全措施

#### 選項 1：IP 白名單（推薦）

在 Vercel/Netlify 設定只允許特定 IP 訪問：

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

  if (DEV_MODE) {
    const allowedIPs = ['YOUR_IP_ADDRESS'];
    const clientIP = request.ip || request.headers.get('x-forwarded-for');

    if (!allowedIPs.includes(clientIP)) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  return NextResponse.next();
}
```

#### 選項 2：簡單密碼保護

添加一個簡單的密碼：

```typescript
// src/lib/devAuth.ts
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'admin123';

export async function devLogin(email: string, password: string) {
  if (DEV_MODE) {
    if (password === DEV_PASSWORD) {
      return { success: true, user: ADMIN_USER };
    }
    return { success: false, error: '密碼錯誤' };
  }
  // ...
}
```

然後在 `.env.local` 設定：
```env
NEXT_PUBLIC_DEV_PASSWORD=your_secure_password_here
```

#### 選項 3：僅在本地啟用

如果只想在本地開發使用：

```typescript
// src/lib/devAuth.ts
export const DEV_MODE =
  process.env.NEXT_PUBLIC_DEV_AUTH === 'true' &&
  process.env.NODE_ENV === 'development';
```

---

## 🔄 切換回正常模式

當 Supabase Auth 修復後，要切換回正常模式：

### 1. 修改 .env.local

```env
# NEXT_PUBLIC_DEV_AUTH=true  # 註解掉這行
```

或改為：
```env
NEXT_PUBLIC_DEV_AUTH=false
```

### 2. 重啟開發伺服器

```bash
# Ctrl+C 停止
npm run dev  # 重新啟動
```

### 3. 生產環境

在 Vercel/Netlify 環境變數中：
- 刪除 `NEXT_PUBLIC_DEV_AUTH`
- 或設定為 `false`
- 重新部署

---

## 🐛 故障排除

### Q: 登入後顯示"未登入"

A: 檢查環境變數是否正確設定：
```bash
cat .env.local | grep DEV_AUTH
# 應該顯示: NEXT_PUBLIC_DEV_AUTH=true
```

### Q: 沒看到黃色開發模式提示

A:
1. 確認環境變數有 `NEXT_PUBLIC_` 前綴
2. 重啟開發伺服器
3. 清除瀏覽器快取

### Q: 部署後無法登入

A:
1. 確認 Vercel 環境變數設定正確
2. 檢查變數名稱拼寫
3. 重新部署觸發更新

### Q: AI 分析顯示沒有資料

A: 這是正常的，因為：
- 管理員帳號已有一些對話記錄
- 但可能沒有太多分析結果
- 建議多進行幾次對話，然後觸發 AI 分析

---

## 📊 測試流程

完整的測試流程：

```bash
# 1. 確認開發模式已啟用
cat .env.local | grep DEV_AUTH

# 2. 啟動開發伺服器
npm run dev

# 3. 測試登入
# 訪問 http://localhost:3000/login
# 輸入任意帳號密碼

# 4. 測試聊天
# 訪問 http://localhost:3000/chat
# 發送訊息測試

# 5. 測試分析
# 訪問 http://localhost:3000/analyze
# 點擊"開始 AI 分析"

# 6. 檢查資料庫
node debug-analysis.js
```

---

## 💡 進階使用

### 切換不同的測試用戶

如果要測試多個用戶，修改 `src/lib/devAuth.ts`:

```typescript
export const ADMIN_USER = {
  id: 'your-test-user-id',  // 改成你要的用戶 ID
  email: 'test@example.com',
  name: '測試用戶'
};
```

### 添加多個測試帳號

```typescript
export const TEST_USERS = {
  admin: {
    id: '7b576435-bd20-4f05-b4c1-b21394870dfd',
    email: 'admin@aimath.com',
    name: '管理員'
  },
  user1: {
    id: 'another-user-id',
    email: 'user1@example.com',
    name: '測試用戶 1'
  }
};

export function devLogin(email: string, password: string) {
  if (DEV_MODE) {
    // 根據 email 選擇不同的用戶
    const user = Object.values(TEST_USERS).find(u => u.email === email);
    return {
      success: true,
      user: user || ADMIN_USER
    };
  }
  // ...
}
```

---

## 📞 需要幫助？

如果遇到問題：
1. 檢查控制台錯誤訊息
2. 確認環境變數設定
3. 重啟開發伺服器
4. 清除瀏覽器快取和 localStorage

祝你使用愉快！🎉
