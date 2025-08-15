import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('analyzed_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }
  return NextResponse.json({ results: data });
}
