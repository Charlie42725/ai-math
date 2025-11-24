#!/usr/bin/env node

/**
 * AI 分析功能診斷工具
 * 幫助快速定位分析失敗的原因
 */

const { createClient } = require('@supabase/supabase-js');

const CONFIG = {
  SUPABASE_URL: 'https://nkvqozsoywrjokzzzgus.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdnFvenNveXdyam9renp6Z3VzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ2NjU5NiwiZXhwIjoyMDcwMDQyNTk2fQ.hFHdT0chPfbYpGsRLJA879EoqIruo3TwKUAqRGZuiF4',
  API_ENDPOINT: 'http://localhost:3000/api/analyze-results/analyze'
};

async function checkSupabase() {
  console.log('\n📊 1. 檢查 Supabase 連接...');
  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

  try {
    // 檢查對話數量
    const { data: chats, error: chatError } = await supabase
      .from('chat_histories')
      .select('id, user_id, messages', { count: 'exact' })
      .limit(5);

    if (chatError) {
      console.log('❌ chat_histories 查詢失敗:', chatError.message);
      return false;
    }

    console.log(`✅ 找到 ${chats.length} 筆對話`);

    // 計算使用者訊息
    let userMsgCount = 0;
    let mathRelatedCount = 0;

    for (const chat of chats) {
      const msgs = chat.messages || [];
      const userMsgs = msgs.filter(m => m.role === 'user');
      userMsgCount += userMsgs.length;

      // 檢查數學相關訊息
      const mathMsgs = userMsgs.filter(m => {
        const text = m.parts?.[0]?.text || '';
        return text.includes('數學') || text.match(/[0-9]+/);
      });
      mathRelatedCount += mathMsgs.length;
    }

    console.log(`   - 使用者訊息總數: ${userMsgCount}`);
    console.log(`   - 數學相關訊息: ${mathRelatedCount}`);

    if (userMsgCount === 0) {
      console.log('⚠️  沒有使用者訊息可以分析');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ Supabase 錯誤:', error.message);
    return false;
  }
}

async function checkAPIEndpoint() {
  console.log('\n🔌 2. 檢查 API 端點...');

  try {
    // 檢查伺服器是否運行
    const pingResponse = await fetch('http://localhost:3000', {
      method: 'HEAD'
    });

    if (!pingResponse.ok) {
      console.log('❌ 開發伺服器未運行');
      console.log('   請執行: npm run dev');
      return false;
    }

    console.log('✅ 開發伺服器正在運行');

    // 測試分析 API
    console.log('   正在測試 /api/analyze-results/analyze...');
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`   狀態碼: ${response.status}`);
    console.log(`   狀態文字: ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    console.log(`   回應類型: ${contentType}`);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('\n❌ API 返回非 JSON 回應:');
      console.log(text.substring(0, 500));
      return false;
    }

    const data = await response.json();
    console.log('\n   API 回應:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\n✅ API 調用成功！已分析 ${data.count || 0} 筆訊息`);
      return true;
    } else {
      console.log('\n❌ API 調用失敗');
      console.log('   錯誤:', data.error);
      return false;
    }

  } catch (error) {
    console.log('❌ API 調用錯誤:', error.message);
    return false;
  }
}

async function checkAnalyzedData() {
  console.log('\n📈 3. 檢查已分析的資料...');
  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

  try {
    const { data, error, count } = await supabase
      .from('analyzed_attempts')
      .select('*', { count: 'exact' })
      .order('analyzed_at', { ascending: false })
      .limit(3);

    if (error) {
      console.log('❌ 查詢失敗:', error.message);
      return false;
    }

    console.log(`✅ 共有 ${count || 0} 筆分析結果`);

    if (data && data.length > 0) {
      console.log('\n   最新的 3 筆資料:');
      data.forEach((item, idx) => {
        console.log(`\n   [${idx + 1}] ID: ${item.id}`);
        console.log(`       概念: ${item.concepts_used?.join(', ') || '無'}`);
        console.log(`       不穩定: ${item.unstable_concepts?.join(', ') || '無'}`);
        console.log(`       時間: ${new Date(item.analyzed_at).toLocaleString('zh-TW')}`);
      });
    }

    return true;
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 AI 分析功能診斷工具');
  console.log('='.repeat(60));

  const checks = [
    checkSupabase,
    checkAPIEndpoint,
    checkAnalyzedData
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const result = await check();
      if (!result) allPassed = false;
    } catch (error) {
      console.log('❌ 檢查失敗:', error.message);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ 所有檢查通過！');
  } else {
    console.log('❌ 部分檢查失敗，請檢查上述錯誤訊息');
  }
}

main();
