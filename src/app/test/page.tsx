import PracticePageMinimal from '@/components/test/PracticePageMinimal';

// 模擬國中數學試題資料
const mockQuestions = [
  {
    id: 1,
    title: "一元二次方程式",
    content: "解下列一元二次方程式：x² - 5x + 6 = 0",
    type: 'multiple' as const,
    options: [
      "x = 1, x = 6",
      "x = 2, x = 3", 
      "x = -2, x = -3",
      "x = 1, x = -6"
    ],
    correctAnswer: "B",
    points: 3
  },
  {
    id: 2,
    title: "二次函數",
    content: "已知二次函數 y = x² - 4x + 3，下列何者正確？",
    type: 'multiple' as const,
    options: [
      "開口向下",
      "頂點為 (2, -1)", 
      "與 x 軸交於 (1, 0) 和 (3, 0)",
      "對稱軸為 x = -2"
    ],
    correctAnswer: "C",
    points: 4
  },
  {
    id: 3,
    title: "相似三角形",
    content: "兩個相似三角形的對應邊長比為 2:3，若較小三角形的面積為 8 平方公分，則較大三角形的面積為多少平方公分？請寫出解題過程。",
    type: 'essay' as const,
    correctAnswer: "面積比 = (邊長比)² = (2:3)² = 4:9，所以較大三角形面積 = 8 × (9/4) = 18 平方公分",
    points: 5
  },
  {
    id: 4,
    title: "機率問題",
    content: "一個袋子裡有紅球3個、白球2個、藍球1個，隨機抽取2個球，請問抽到1個紅球和1個白球的機率為何？",
    type: 'multiple' as const,
    options: [
      "1/5",
      "2/5", 
      "1/3",
      "2/3"
    ],
    correctAnswer: "B",
    points: 4
  },
  {
    id: 5,
    title: "圓的性質",
    content: "圓心角 60° 所對的弧長為 2π 公分，則此圓的半徑為多少公分？",
    type: 'multiple' as const,
    options: [
      "3 公分",
      "6 公分", 
      "9 公分",
      "12 公分"
    ],
    correctAnswer: "B",
    points: 3
  }
];

export default function TestPage() {
  return <PracticePageMinimal questions={mockQuestions} />;
}
