-- 測驗會話表
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_questions INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  earned_score INTEGER NOT NULL,
  time_spent INTEGER NOT NULL, -- 用時（秒）
  settings JSONB DEFAULT '{}', -- 考試設定
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 測驗答案詳情表
CREATE TABLE IF NOT EXISTS test_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_content TEXT NOT NULL,
  question_type TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  user_process TEXT DEFAULT '',
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points INTEGER NOT NULL,
  feedback TEXT DEFAULT '',
  explanation TEXT DEFAULT '',
  detailed_analysis TEXT DEFAULT '',
  thinking_process TEXT DEFAULT '',
  thinking_score INTEGER DEFAULT 0,
  optimization TEXT DEFAULT '',
  suggestions JSONB DEFAULT '[]',
  step_by_step_solution JSONB DEFAULT '[]',
  key_points JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以優化查詢
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_created_at ON test_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_test_answers_session_id ON test_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_question_id ON test_answers(question_id);

-- 啟用 RLS (Row Level Security)
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略：使用者只能訪問自己的測驗記錄
CREATE POLICY "Users can view their own test sessions"
  ON test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test sessions"
  ON test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view answers for their own sessions"
  ON test_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_sessions
      WHERE test_sessions.id = test_answers.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for their own sessions"
  ON test_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_sessions
      WHERE test_sessions.id = test_answers.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );
