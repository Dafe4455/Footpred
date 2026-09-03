// lib/prediction/cards.ts
interface CardFactors {
  homeYellowsPerGame: number;
  awayYellowsPerGame: number;
  homeFoulsPerGame: number;
  awayFoulsPerGame: number;
  refereeAvgCards: number;
  leagueAvgCards: number;
  matchIntensity: number; // 1.0 normal, 1.3 high stakes
  temperature: number; // hot weather increases aggression
}

function predictCards(factors: CardFactors): { expected: number; over35: number; over45: number } {
  const base = (factors.homeYellowsPerGame + factors.awayYellowsPerGame) / 2;
  const refereeFactor = factors.refereeAvgCards / factors.leagueAvgCards;
  const intensityFactor = factors.matchIntensity;
  
  const expected = base * refereeFactor * intensityFactor;
  
  // Cards follow a Poisson-like distribution but with higher variance
  const over35 = 1 - poissonCDF(3, expected);
  const over45 = 1 - poissonCDF(4, expected);
  
  return { expected: Math.round(expected * 10) / 10, over35, over45 };
}
