import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function extractUserMessages() {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, user_id, messages');

  if (error) throw error;

  const results: any[] = [];

  for (const conv of conversations) {
    const msgs = conv.messages || [];
    msgs.forEach((msg: any, index: number) => {
      if (msg.role === 'user') {
        results.push({
          conversation_id: conv.id,
          user_id: conv.user_id,
          message_index: index + 1,
          text: msg.parts?.[0]?.text || '',
          timestamp: msg.timestamp || null
        });
      }
    });
  }

  return results;
}
