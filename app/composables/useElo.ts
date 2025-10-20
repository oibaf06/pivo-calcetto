export const useElo = () => {
  const calculateElo = (ratingA: number, ratingB: number, scoreA: number) => {
    const expectedScoreA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
    const k = 32
    return Math.round(ratingA + k * (scoreA - expectedScoreA))
  }

  return {
    calculateElo,
  }
}