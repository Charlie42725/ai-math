# 测验复盘功能

## 功能说明

现在测验结束后，系统会自动保存所有题目的答案和AI分析结果到数据库，用户可以随时查看历史测验记录并复盘。

## 新增功能

### 1. 测验结果自动保存
- 测验结束后自动保存到数据库
- 包括所有题目、答案、得分和AI分析

### 2. 测验历史列表页面
- 路径: `/test-history`
- 显示所有历史测验记录
- 包括：日期、题目数、得分、用时等信息
- 点击任意记录可查看详细复盘

### 3. 详细复盘页面
- 路径: `/test-history/[id]`
- 显示该次测验的所有题目
- 题目导航：快速跳转到任意题目，绿色=正确，红色=错误
- 每题显示：
  - 题目内容
  - 你的答案和解题过程
  - 正确答案
  - AI详细分析（思维过程评分、优化建议、标准解法等）
  
### 4. 导航入口
- 顶部导航栏新增"复盘"菜单
- 测验结束页面新增"查看详细复盘"按钮

## 数据库设置

需要在 Supabase 中执行以下SQL脚本来创建必要的表：

```sql
-- 在 Supabase SQL Editor 中执行 database/create_test_sessions_tables.sql
```

或者直接在 Supabase Dashboard 的 SQL Editor 中复制粘贴该文件内容执行。

## 使用方法

1. **完成测验**：正常完成测验并提交

2. **查看结果**：在测验结果页面点击"查看详细复盘"

3. **历史复盘**：
   - 点击顶部导航的"复盘"菜单
   - 选择任意历史记录查看

4. **题目导航**：
   - 在复盘页面使用题目导航快速跳转
   - 绿色按钮 = 答对的题目
   - 红色按钮 = 答错的题目
   - 黄色按钮 = 当前查看的题目

## API端点

### GET /api/test-sessions?userId={userId}
获取用户的所有测验记录

### POST /api/test-sessions
保存新的测验结果

### GET /api/test-sessions/[id]
获取特定测验的详细信息

## 数据结构

### test_sessions 表
- id: 测验会话ID
- user_id: 用户ID
- total_questions: 总题数
- total_score: 总分
- earned_score: 得分
- time_spent: 用时（秒）
- settings: 考试设置（JSON）
- created_at: 创建时间

### test_answers 表
- id: 答案记录ID
- session_id: 所属测验会话ID
- question_id: 题目ID
- question_content: 题目内容
- question_type: 题目类型
- user_answer: 用户答案
- user_process: 解题过程
- correct_answer: 正确答案
- is_correct: 是否正确
- points: 分值
- feedback: 反馈
- explanation: 解释
- detailed_analysis: 详细分析
- thinking_process: 思维过程评估
- thinking_score: 思维得分
- optimization: 优化建议
- suggestions: 学习建议（JSON数组）
- step_by_step_solution: 标准解法步骤（JSON数组）
- key_points: 关键知识点（JSON数组）
- created_at: 创建时间

## 注意事项

1. 需要先在 Supabase 中执行 SQL 脚本创建表
2. 确保 RLS (Row Level Security) 已正确配置
3. 用户只能访问自己的测验记录
4. 支持开发模式 (DEV_MODE) 的管理员用户
