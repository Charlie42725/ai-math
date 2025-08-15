import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Row = {
  user_id: string;
  conversation_id: string;
  message_index: number;
  text: string;
  is_attempt: boolean | null;
  unit: string | null;
  grade: string | null;
  question_id: string | null;
  final_answer: string | null;
  confidence: number | null;
};

export async function saveAnalysisResults(rows: Row[]) {
  if (!rows.length) {
    console.log('[save] 沒有可儲存的分析結果');
    return;
  }
  const { error } = await supabase.from('analyzed_attempts').insert(rows);
  if (error) {
    console.error('[save] 失敗:', error.message);
    throw new Error(error.message);
  }
  console.log(`[save] 已儲存 ${rows.length} 筆分析結果`);
}

if (require.main === module) {
  console.log('此檔為 library，請由 analyzeMessages.ts 呼叫');
}
