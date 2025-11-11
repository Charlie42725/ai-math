import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  // Create Supabase client at runtime, not at module load time
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 依 user_id 過濾分析資料
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  let query = supabase
    .from('analyzed_attempts')
    .select('*')
    .order('analyzed_at', { ascending: false })
    .limit(200);
  if (user_id) {
    query = query.eq('user_id', user_id);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
