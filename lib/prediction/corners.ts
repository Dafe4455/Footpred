// lib/prediction/corners.ts
interface CornerFactors {
  homeCornersPerGame: number;
  awayCornersPerGame: number;
  homeConcededPerGame: number;
  awayConcededPerGame: number;
  homePossession: number;
  awayPossession: number;
  homeCrossingRate: number; // crosses per 90
  awayCrossingRate: number;
  matchImportance: number; // 1.0 normal, 1.1 derby, 0.9 dead rubber
}

function predictCorners(factors: CornerFactors): { expected: number; over95: number; over105: number } {
  // Base expectation from team averages
  const baseHome = (factors.homeCornersPerGame + factors.awayConcededPerGame) / 2;
  const baseAway = (factors.awayCornersPerGame + factors.homeConcededPerGame) / 2;
  
  // Style adjustments
  const styleMultiplier = 1 + (factors.homeCrossingRate + factors.awayCrossingRate) * 0.05;
  
  // Possession adjustment (more possession = more attacking = more corners)
  const possessionFactor = (factors.homePossession + factors.awayPossession) / 100;
  
  const expected = (baseHome + baseAway) * styleMultiplier * factors.matchImportance * possessionFactor;
  
  // Over/Under probabilities (using Poisson or negative binomial)
  const over95 = 1 - poissonCDF(9, expected);
  const over105 = 1 - poissonCDF(10, expected);
  
  return { expected: Math.round(expected * 10) / 10, over95, over105 };
}
