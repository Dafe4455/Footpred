// 
import { create, all } from 'mathjs';

const math = create(all, {});

interface TeamMetrics {
  attackStrength: number;  // xG scored per game (adjusted for opponent)
  defenseWeakness: number; // xG conceded per game (adjusted for opponent)
  homeAdvantage: number;
  recentFormWeight: number; // 0.6 for last 5, 0.4 for last 10
}

function poissonPMF(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / math.factorial(k);
}

function predictScoreDistribution(
  homeAttack: number,
  homeDefense: number,
  awayAttack: number,
  awayDefense: number,
  leagueAvgHomeXg: number,
  leagueAvgAwayXg: number,
  maxGoals: number = 8
): { matrix: number[][], mostLikely: string, probabilities: Record<string, number> } {
  
  // Adjusted xG for this matchup
  const homeExpectedXg = homeAttack * awayDefense * leagueAvgHomeXg;
  const awayExpectedXg = awayAttack * homeDefense * leagueAvgAwayXg;
  
  const matrix: number[][] = [];
  const probabilities: Record<string, number> = {};
  
  let maxProb = 0;
  let mostLikely = '0-0';
  
  for (let i = 0; i <= maxGoals; i++) {
    matrix[i] = [];
    for (let j = 0; j <= maxGoals; j++) {
      const prob = poissonPMF(i, homeExpectedXg) * poissonPMF(j, awayExpectedXg);
      matrix[i][j] = prob;
      probabilities[`${i}-${j}`] = prob;
      
      if (prob > maxProb) {
        maxProb = prob;
        mostLikely = `${i}-${j}`;
      }
    }
  }
  
  return { matrix, mostLikely, probabilities };
}

// Derived probabilities
function deriveMarketProbabilities(matrix: number[][], maxGoals: number) {
  let homeWin = 0, draw = 0, awayWin = 0;
  let over25 = 0, under25 = 0;
  
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      const prob = matrix[i][j];
      if (i > j) homeWin += prob;
      else if (i === j) draw += prob;
      else awayWin += prob;
      
      if (i + j > 2.5) over25 += prob;
      else under25 += prob;
    }
  }
  
  return { homeWin, draw, awayWin, over25, under25 };
}
