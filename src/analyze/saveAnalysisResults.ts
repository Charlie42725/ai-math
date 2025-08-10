import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 用 Service Role Key
);

export async function saveAnalysisResults(results: any[]) {
  if (!results.length) {
    console.log('沒有可儲存的分析結果');
    return;
  }

  const { error } = await supabase
    .from('analyzed_attempts')
    .insert(results);

  if (error) {
    console.error('儲存分析結果失敗:', error);
  } else {
    console.log(`已儲存 ${results.length} 筆分析結果`);
  }
}
