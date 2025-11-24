/**
 * 開發模式認證
 * 繞過 Supabase Auth，使用固定的管理員帳號
 */

// 管理員用戶 ID（從現有資料庫中的用戶）
export const ADMIN_USER = {
  id: '7b576435-bd20-4f05-b4c1-b21394870dfd',
  email: 'admin@aimath.com',
  name: '管理員'
};

// 開發模式開關
export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

/**
 * 取得當前用戶（開發模式）
 */
export function getDevUser() {
  if (DEV_MODE) {
    return ADMIN_USER;
  }
  return null;
}

/**
 * 檢查是否已登入（開發模式）
 */
export function isDevAuthenticated(): boolean {
  return DEV_MODE;
}

/**
 * 開發模式登入（總是成功）
 */
export async function devLogin(email: string, password: string) {
  if (DEV_MODE) {
    return {
      success: true,
      user: ADMIN_USER
    };
  }
  return {
    success: false,
    error: '開發模式未啟用'
  };
}
