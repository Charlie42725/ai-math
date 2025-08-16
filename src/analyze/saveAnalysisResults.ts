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

  concepts_used: string[] | null;
  unstable_concepts: string[] | null;
  thinking_style: string | null;
  expression: string | null;
  ai_feedback: string[] | null;

  confidence: number | null;
  analyzed_at: string; // ISO timestamp
};

export async function saveAnalysisResults(rows: Row[]) {
  if (!rows.length) {
    console.log('[save] 沒有可儲存的分析結果');
    return;
  }

  // 統一補上 analyzed_at
  const rowsWithTime = rows.map(r => ({
    ...r,
    analyzed_at: r.analyzed_at || new Date().toISOString(),
  }));

  const { error } = await supabase.from('analyzed_attempts').insert(rowsWithTime);

  if (error) {
    console.error('[save] 失敗:', error.message);
    throw new Error(error.message);
  }
  console.log(`[save] 已儲存 ${rowsWithTime.length} 筆分析結果`);
}

if (require.main === module) {
  console.log('此檔為 library，請由 analyzeMessages.ts 呼叫');
}
