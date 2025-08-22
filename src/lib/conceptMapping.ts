// 概念對應表：將各種表達方式統一對應到課程單元
export const conceptMapping: Record<string, string> = {
  // 幾何相關
  '立體幾何': '生活中的立體圖形',
  '展開圖': '生活中的立體圖形',
  '空間概念': '生活中的立體圖形',
  '三角柱': '生活中的立體圖形',
  '正方體': '生活中的立體圖形',
  '長方體': '生活中的立體圖形',
  '立體圖形': '生活中的立體圖形',
  '體積': '生活中的立體圖形',
  '表面積': '生活中的立體圖形',
  
  // 三角形相關
  '三角形': '三角形的基本性質',
  '全等': '三角形的基本性質',
  '內角': '三角形的基本性質',
  '外角': '三角形的基本性質',
  '邊角關係': '三角形的基本性質',
  
  // 平行相關
  '平行': '平行與四邊形',
  '平行四邊形': '平行與四邊形',
  '四邊形': '平行與四邊形',
  
  // 代數相關
  '方程式': '一元一次方程式',
  '一次方程式': '一元一次方程式',
  '聯立方程式': '二元一次聯立方程式',
  '二次方程式': '一元二次方程式',
  
  // 函數相關
  '函數': '線型函數',
  '二次函數': '二次函數',
  '圖形': '線型函數',
  
  // 運算相關
  '整數': '整數的運算',
  '分數': '分數的運算',
  '小數': '分數的運算',
  '四則運算': '整數的運算',
  '乘法': '乘法公式與多項式',
  '因式分解': '因式分解',
  '多項式': '乘法公式與多項式',
  
  // 根號相關
  '平方根': '平方根與畢氏定理',
  '根號': '平方根與畢氏定理',
  '畢氏定理': '平方根與畢氏定理',
  
  // 統計相關
  '統計': '統計',
  '圖表': '統計資料處理與圖表',
  '機率': '統計與機率',
  '資料分析': '統計與機率',
  
  // 幾何進階
  '圓': '圓形',
  '相似': '相似形',
  '比例': '比與比例式',
  '坐標': '直角坐標與二元一次方程式的圖形',
  
  // 其他常見錯誤概念
  '計算方法': '整數的運算',
  '圖形分析': '生活中的幾何',
  '空間想像': '生活中的立體圖形',
  '邏輯推理': '外心內心與重心',
};

// 標準化概念名稱的函數 - 更積極地合併相關概念
export function standardizeConcept(concept: string): string {
  const cleaned = concept
    .replace(/的關係|與.*的關係/g, '')
    .replace(/理解|掌握|計算|求解|分析/g, '')
    .trim();
  
  // 立體圖形相關 - 全部歸類為立體圖形
  if (cleaned.match(/立體|圖形|三角柱|正方體|長方體|圓柱|展開|體積|表面積|空間|側面|底面/)) {
    return '生活中的立體圖形';
  }
  
  // 平面幾何相關
  if (cleaned.match(/三角形|全等|內角|外角|邊角|垂直|平行|四邊形|相似|圓/)) {
    if (cleaned.includes('三角形') || cleaned.includes('全等') || cleaned.includes('角')) {
      return '三角形的基本性質';
    }
    if (cleaned.includes('平行') || cleaned.includes('四邊形')) {
      return '平行與四邊形';
    }
    if (cleaned.includes('相似')) {
      return '相似形';
    }
    if (cleaned.includes('圓')) {
      return '圓形';
    }
    return '生活中的幾何';
  }
  
  // 代數相關
  if (cleaned.match(/方程式|一次|二次|聯立|未知數|解|代數/)) {
    if (cleaned.includes('二次')) {
      return '一元二次方程式';
    }
    if (cleaned.includes('聯立') || cleaned.includes('二元')) {
      return '二元一次聯立方程式';
    }
    return '一元一次方程式';
  }
  
  // 運算相關
  if (cleaned.match(/整數|分數|小數|四則|加減|乘除|運算/)) {
    if (cleaned.includes('分數') || cleaned.includes('小數')) {
      return '分數的運算';
    }
    return '整數的運算';
  }
  
  // 函數相關
  if (cleaned.match(/函數|圖形|坐標|直線|拋物線/)) {
    if (cleaned.includes('二次') || cleaned.includes('拋物線')) {
      return '二次函數';
    }
    if (cleaned.includes('坐標')) {
      return '直角坐標與二元一次方程式的圖形';
    }
    return '線型函數';
  }
  
  // 統計相關
  if (cleaned.match(/統計|圖表|機率|資料|分析/)) {
    if (cleaned.includes('機率')) {
      return '統計與機率';
    }
    return '統計';
  }
  
  // 其他數學概念
  if (cleaned.match(/因式|分解/)) {
    return '因式分解';
  }
  if (cleaned.match(/多項式|乘法公式/)) {
    return '乘法公式與多項式';
  }
  if (cleaned.match(/平方根|根號|畢氏|勾股/)) {
    return '平方根與畢氏定理';
  }
  if (cleaned.match(/比例|正比|反比/)) {
    return '比與比例式';
  }
  if (cleaned.match(/不等式/)) {
    return '一元一次不等式';
  }
  
  // 如果都沒匹配，回傳清理後的名稱
  return cleaned || concept;
}
