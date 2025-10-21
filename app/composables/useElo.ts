export const useElo = () => {
  const calculateElo = (teamA: { elo: number }[], teamB: { elo: number }[], scoreA: number) => {
    const ratingA = teamA.reduce((acc, player) => acc + player.elo, 0) / teamA.length
    const ratingB = teamB.reduce((acc, player) => acc + player.elo, 0) / teamB.length

    const expectedScoreA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
    const k = 32
    const newRatingA = Math.round(ratingA + k * (scoreA - expectedScoreA))
    const eloChange = newRatingA - ratingA

    return {
      teamA: teamA.map(player => ({ ...player, elo: player.elo + eloChange, oldElo: player.elo })),
      teamB: teamB.map(player => ({ ...player, elo: player.elo - eloChange, oldElo: player.elo })),
    }
  }

  return {
    calculateElo,
  }
}