/**
 * 檢查 Supabase 數據庫中的用戶資料
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 環境變數');
  console.log('請確保 .env.local 包含：');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('📊 正在檢查數據庫用戶資料...\n');

  try {
    // 檢查 chat_histories 表
    const { data: chatHistories, error: chatError } = await supabase
      .from('chat_histories')
      .select('user_id, title, created_at')
      .limit(10);

    if (chatError) {
      console.log('⚠️  chat_histories 表查詢錯誤:', chatError.message);
    } else {
      console.log(`✅ chat_histories: 找到 ${chatHistories?.length || 0} 筆記錄`);
      if (chatHistories && chatHistories.length > 0) {
        console.log('   最近的對話：');
        chatHistories.slice(0, 3).forEach((chat, i) => {
          console.log(`   ${i + 1}. ${chat.title} (用戶: ${chat.user_id.substring(0, 8)}...)`);
        });
      }
    }

    // 檢查 attempts 表
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('user_id, question_id, is_correct, score')
      .limit(10);

    if (attemptsError) {
      console.log('\n⚠️  attempts 表查詢錯誤:', attemptsError.message);
    } else {
      console.log(`\n✅ attempts: 找到 ${attempts?.length || 0} 筆記錄`);
      if (attempts && attempts.length > 0) {
        console.log('   最近的答題記錄：');
        attempts.slice(0, 3).forEach((attempt, i) => {
          console.log(`   ${i + 1}. 題目 ${attempt.question_id} - ${attempt.is_correct ? '✓ 正確' : '✗ 錯誤'} (分數: ${attempt.score || 'N/A'})`);
        });
      }
    }

    // 檢查 analyzed_attempts 表
    const { data: analyzed, error: analyzedError } = await supabase
      .from('analyzed_attempts')
      .select('user_id, text, confidence, analyzed_at')
      .limit(10);

    if (analyzedError) {
      console.log('\n⚠️  analyzed_attempts 表查詢錯誤:', analyzedError.message);
    } else {
      console.log(`\n✅ analyzed_attempts: 找到 ${analyzed?.length || 0} 筆記錄`);
      if (analyzed && analyzed.length > 0) {
        console.log('   最近的分析記錄：');
        analyzed.slice(0, 3).forEach((record, i) => {
          const preview = record.text ? record.text.substring(0, 30) + '...' : 'N/A';
          console.log(`   ${i + 1}. "${preview}" (信心度: ${record.confidence || 'N/A'})`);
        });
      }
    }

    // 統計不同的用戶
    const uniqueUsers = new Set();
    if (chatHistories) chatHistories.forEach(c => uniqueUsers.add(c.user_id));
    if (attempts) attempts.forEach(a => uniqueUsers.add(a.user_id));
    if (analyzed) analyzed.forEach(a => uniqueUsers.add(a.user_id));

    console.log('\n📈 統計摘要：');
    console.log(`   總共發現 ${uniqueUsers.size} 個不同的用戶 ID`);
    console.log(`   聊天記錄: ${chatHistories?.length || 0} 筆`);
    console.log(`   答題記錄: ${attempts?.length || 0} 筆`);
    console.log(`   分析記錄: ${analyzed?.length || 0} 筆`);

    if (uniqueUsers.size === 0) {
      console.log('\n⚠️  數據庫目前沒有用戶資料');
      console.log('   建議：');
      console.log('   1. 訪問 /signup 註冊一個新帳戶');
      console.log('   2. 或訪問 /login 使用開發模式登入');
      console.log('   3. 使用應用程序創建一些數據');
    } else {
      console.log('\n✅ 數據庫包含用戶資料，系統運作正常！');
    }

  } catch (error) {
    console.error('\n❌ 檢查過程中發生錯誤:', error.message);
  }
}

checkUsers();
