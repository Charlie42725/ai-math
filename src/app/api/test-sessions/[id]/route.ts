import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: 獲取特定測驗的詳細資訊
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // 獲取測驗基本資訊
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('獲取測驗資訊失敗:', sessionError);
      return Response.json(
        { success: false, error: '獲取測驗資訊失敗' },
        { status: 500 }
      );
    }

    if (!session) {
      return Response.json(
        { success: false, error: '測驗不存在' },
        { status: 404 }
      );
    }

    // 獲取所有答案詳情
    const { data: answers, error: answersError } = await supabase
      .from('test_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_id', { ascending: true });

    if (answersError) {
      console.error('獲取答案詳情失敗:', answersError);
      return Response.json(
        { success: false, error: '獲取答案詳情失敗' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        session,
        answers: answers || []
      }
    });
  } catch (error: any) {
    console.error('API错误:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
