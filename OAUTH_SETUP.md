# OAuth 第三方登入設定指南

本專案已實作 Google、Microsoft (Azure AD) 和 Apple 的第三方登入功能。以下是在 Supabase 後台配置這些服務的步驟。

## 📋 目錄
- [Google OAuth 設定](#google-oauth-設定)
- [Microsoft (Azure AD) OAuth 設定](#microsoft-azure-ad-oauth-設定)
- [Apple OAuth 設定](#apple-oauth-設定)
- [測試第三方登入](#測試第三方登入)

---

## 🌐 Google OAuth 設定

### 步驟 1: 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API

### 步驟 2: 設定 OAuth 同意畫面

1. 在左側選單中，選擇 **APIs & Services > OAuth consent screen**
2. 選擇使用者類型（Internal 或 External）
3. 填寫應用程式資訊：
   - 應用程式名稱：`AI Math Platform`
   - 使用者支援電子郵件
   - 開發人員聯絡資訊
4. 儲存並繼續

### 步驟 3: 建立 OAuth 2.0 憑證

1. 前往 **APIs & Services > Credentials**
2. 點擊 **Create Credentials > OAuth 2.0 Client ID**
3. 選擇應用程式類型：**Web application**
4. 設定授權重新導向 URI：
   ```
   https://nkvqozsoywrjokzzzgus.supabase.co/auth/v1/callback
   ```
   ⚠️ 注意：將 `nkvqozsoywrjokzzzgus` 替換為您的 Supabase 專案參考 ID

5. 複製 **Client ID** 和 **Client Secret**

### 步驟 4: 在 Supabase 設定 Google Provider

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇您的專案
3. 前往 **Authentication > Providers**
4. 找到 **Google** 並點擊啟用
5. 輸入從 Google Cloud 取得的：
   - **Client ID**
   - **Client Secret**
6. 儲存設定

---

## 🪟 Microsoft (Azure AD) OAuth 設定

### 步驟 1: 註冊應用程式

1. 前往 [Azure Portal](https://portal.azure.com/)
2. 選擇 **Azure Active Directory > App registrations**
3. 點擊 **New registration**
4. 填寫資訊：
   - 名稱：`AI Math Platform`
   - 支援的帳戶類型：選擇適合的選項
   - 重新導向 URI：
     ```
     https://nkvqozsoywrjokzzzgus.supabase.co/auth/v1/callback
     ```

### 步驟 2: 建立 Client Secret

1. 在應用程式頁面，選擇 **Certificates & secrets**
2. 點擊 **New client secret**
3. 輸入描述並選擇到期時間
4. 複製產生的 **Value**（這是您的 Client Secret）

### 步驟 3: 取得應用程式資訊

1. 在應用程式的 **Overview** 頁面，複製：
   - **Application (client) ID**
   - **Directory (tenant) ID**

### 步驟 4: 在 Supabase 設定 Azure Provider

1. 前往 Supabase Dashboard > **Authentication > Providers**
2. 找到 **Azure** 並啟用
3. 輸入：
   - **Client ID**：Azure 的 Application (client) ID
   - **Client Secret**：您建立的 secret value
   - **Azure Tenant** (可選)：您的 tenant ID 或 "common"
4. 儲存設定

---

## 🍎 Apple OAuth 設定

### 步驟 1: 註冊 App ID

1. 登入 [Apple Developer](https://developer.apple.com/account/)
2. 前往 **Certificates, Identifiers & Profiles**
3. 選擇 **Identifiers** > 點擊 **+** 按鈕
4. 選擇 **App IDs** > 繼續
5. 選擇類型：**App**
6. 填寫：
   - Description: `AI Math Platform`
   - Bundle ID: `com.yourdomain.aimathplatform`
7. 勾選 **Sign in with Apple**
8. 儲存

### 步驟 2: 建立 Service ID

1. 建立新的 Identifier，選擇 **Services IDs**
2. 填寫：
   - Description: `AI Math Platform Web`
   - Identifier: `com.yourdomain.aimathplatform.web`
3. 勾選 **Sign in with Apple**
4. 點擊 Configure：
   - Primary App ID: 選擇步驟 1 建立的 App ID
   - Domains and Subdomains: `nkvqozsoywrjokzzzgus.supabase.co`
   - Return URLs: `https://nkvqozsoywrjokzzzgus.supabase.co/auth/v1/callback`
5. 儲存

### 步驟 3: 建立 Private Key

1. 前往 **Keys** > 點擊 **+**
2. 填寫 Key Name
3. 勾選 **Sign in with Apple**
4. Configure 並選擇您的 App ID
5. 下載 `.p8` 私鑰檔案（只能下載一次，請妥善保管）
6. 記下 **Key ID**

### 步驟 4: 在 Supabase 設定 Apple Provider

1. 前往 Supabase Dashboard > **Authentication > Providers**
2. 找到 **Apple** 並啟用
3. 輸入：
   - **Client ID**：您的 Service ID (com.yourdomain.aimathplatform.web)
   - **Team ID**：您的 Apple Developer Team ID
   - **Key ID**：私鑰的 Key ID
   - **Private Key**：.p8 檔案的內容
4. 儲存設定

---

## ✅ 測試第三方登入

### 本地測試

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 前往 `http://localhost:3000/login` 或 `http://localhost:3000/signup`

3. 點擊相應的第三方登入按鈕

4. 完成 OAuth 流程後，應該會自動跳轉到 `/chat` 頁面

### 生產環境設定

部署到生產環境時，請記得：

1. 在 OAuth 提供商（Google、Azure、Apple）中添加生產環境的重新導向 URI：
   ```
   https://your-production-domain.com/chat
   ```

2. 確保 Supabase 專案的 **Site URL** 設定正確：
   - 前往 Supabase Dashboard > **Authentication > URL Configuration**
   - 設定 **Site URL** 為您的生產網域

---

## 🔍 常見問題

### Q: OAuth 登入失敗怎麼辦？

**A:** 檢查以下項目：
1. Supabase Provider 是否正確啟用
2. Client ID 和 Client Secret 是否正確
3. 重新導向 URI 是否完全匹配
4. 瀏覽器控制台是否有錯誤訊息

### Q: 重新導向 URI 不匹配？

**A:** 確保在 OAuth 提供商和 Supabase 中設定的重新導向 URI 完全一致，包括協定（https）和路徑。

### Q: 使用者登入後看不到資料？

**A:** 檢查 Supabase 的 Row Level Security (RLS) 政策，確保已授權的使用者可以存取資料。

---

## 📚 相關文件

- [Supabase Auth 文件](https://supabase.com/docs/guides/auth)
- [Google OAuth 文件](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)

---

## 🎉 完成！

現在您的平台已支援多種登入方式，為使用者提供更便利的註冊和登入體驗！
