import Image from 'next/image';

interface Question {
  id: number;
  title: string;
  content: string;
  type: 'multiple' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
  image?: string;
}

interface QuestionAreaProps {
  question: Question;
  questionNumber: number;
}

export default function QuestionArea({ question, questionNumber }: QuestionAreaProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      {/* 題目標題 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-sm">
            {questionNumber}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              第 {questionNumber} 小題
            </h2>
            {question.title && (
              <p className="text-slate-400 text-sm mt-1">{question.title}</p>
            )}
          </div>
        </div>
        
        {/* 分數標示 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">{question.points} 分</span>
          <div className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
            {question.type === 'multiple' ? '選擇題' : '開放題'}
          </div>
        </div>
      </div>

      {/* 題目內容 */}
      <div className="space-y-4">
        {/* 文字內容 */}
        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
          {question.content}
        </div>

        {/* 圖片（如果有） */}
        {question.image && (
          <div className="flex justify-center py-4">
            <div className="relative max-w-2xl w-full">
              <Image
                src={question.image}
                alt={`第 ${questionNumber} 題圖片`}
                width={600}
                height={400}
                className="rounded-lg border border-slate-600/50 shadow-lg"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* 選擇題選項預覽（不含互動功能） */}
        {question.type === 'multiple' && question.options && (
          <div className="mt-6">
            <p className="text-slate-400 text-sm mb-3">選項：</p>
            <div className="grid gap-2">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-slate-600/50 text-slate-300 rounded-full text-sm font-medium mt-0.5">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-slate-200 flex-1">{option}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {question.type === 'multiple' 
              ? '請在下方選擇答案' 
              : '請在下方輸入您的答案'
            }
          </span>
          <span className="text-amber-400">
            配分：{question.points} 分
          </span>
        </div>
      </div>
    </div>
  );
}
