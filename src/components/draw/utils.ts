export function getRandomPrize(): string {
  if (Math.random() < 0.3) {
    // 30% 機率獲得點數獎勵
    const points = Math.floor(Math.random() * 451) + 50; // 50-500點
    return `${points}點`;
  } else {
    // 70% 機率是再接再厲
    return "再接再厲";
  }
}

export function isPrizePoints(prize: string): boolean {
  return prize.includes("點");
}
