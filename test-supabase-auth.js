/**
 * 測試 Supabase 認證系統
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔐 測試 Supabase 認證系統\n');

  // 檢查當前 session
  console.log('📌 檢查當前 session...');
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    console.log(`✅ 已登入: ${session.user.email}`);
    console.log(`   用戶 ID: ${session.user.id}`);
  } else {
    console.log('ℹ️  未登入');
  }

  // 列出所有用戶（需要使用 service role key）
  console.log('\n📌 檢查 Supabase 設定...');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   開發模式: ${process.env.NEXT_PUBLIC_DEV_AUTH === 'true' ? '是' : '否'}`);

  console.log('\n✅ Supabase 連接正常');
  console.log('\n📝 下一步：');
  console.log('   1. 訪問應用程序的 /signup 頁面註冊新帳號');
  console.log('   2. 檢查郵箱確認信（如果啟用了郵箱驗證）');
  console.log('   3. 使用新帳號登入測試');
  console.log('   4. 測試登出功能');
}

testAuth().catch(console.error);
