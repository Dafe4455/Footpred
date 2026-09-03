// app/api/predictions/[matchId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { predictions, matches, teamForm } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  
  // Try cached prediction first
  const cached = await db.query.predictions.findFirst({
    where: eq(predictions.matchId, parseInt(matchId)),
    with: {
      match: {
        with: {
          homeTeam: true,
          awayTeam: true
        }
      }
    }
  });
  
  if (cached && isFresh(cached.computedAt)) {
    return NextResponse.json(cached);
  }
  
  // Fallback: compute on-demand (rate-limited)
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, parseInt(matchId)),
    with: { homeTeam: true, awayTeam: true }
  });
  
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
  
  // Compute fresh prediction
  const prediction = await computePrediction(match);
  
  // Cache for next request
  await db.insert(predictions).values(prediction).onConflictDoUpdate({
    target: predictions.matchId,
    set: prediction
  });
  
  return NextResponse.json(prediction);
}
