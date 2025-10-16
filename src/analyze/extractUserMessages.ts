import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ExtractedMsg = {
  conversation_id: string;
  user_id: string;
  message_index: number;
  text: string;
  timestamp: string | null;
};

export async function extractUserMessages(): Promise<ExtractedMsg[]> {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, user_id, messages')
    .limit(1000);

  if (error) throw new Error(`讀取 conversations 錯誤: ${error.message}`);

  console.log('[extract] conversations count =', conversations?.length ?? 0);
  if (!conversations?.length) return [];

  const results: ExtractedMsg[] = [];

  for (const conv of conversations) {
    const msgs: Array<{ role?: string; parts?: Array<{ text?: string }>; timestamp?: string }> = Array.isArray(conv.messages) ? conv.messages : [];
    msgs.forEach((msg, index: number) => {
      const role = msg?.role;
      const text = msg?.parts?.[0]?.text ?? '';
      if (role === 'user' && text.trim().length > 0) {
        results.push({
          conversation_id: conv.id,
          user_id: conv.user_id,
          message_index: index + 1,
          text,
          timestamp: msg.timestamp ?? null,
        });
      }
    });
  }

  console.log('[extract] user messages =', results.length);
  if (results.length > 0) {
    console.log('[extract] sample =', results[0]);
  }
  return results;
}

if (require.main === module) {
  extractUserMessages().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
