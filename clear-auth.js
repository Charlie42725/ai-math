// 清理 Supabase 認證狀態的腳本
// 使用方式：在開發者工具的 Console 中執行此代碼

console.log('開始清理 Supabase 認證狀態...');

// 清理所有 Supabase 相關的 localStorage
const keys = Object.keys(localStorage);
let clearedCount = 0;

keys.forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log('清理:', key);
    localStorage.removeItem(key);
    clearedCount++;
  }
});

console.log(`✅ 已清理 ${clearedCount} 個項目`);
console.log('請重新整理頁面並重新登入');

// 也可以使用這個函數：
// localStorage.clear(); // 清理所有 localStorage
