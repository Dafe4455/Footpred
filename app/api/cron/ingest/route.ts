// app/api/cron/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ingestMatches, computeForm, generatePredictions } from '@/lib/jobs';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Step 1: Fetch new match results and upcoming fixtures
    const matchesIngested = await ingestMatches();
    
    // Step 2: Recompute rolling form metrics for affected teams
    const formUpdated = await computeForm();
    
    // Step 3: Generate predictions for upcoming matches
    const predictionsGenerated = await generatePredictions();
    
    return NextResponse.json({
      success: true,
      matchesIngested,
      formUpdated,
      predictionsGenerated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log to external service (e.g., Sentry, Logflare)
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Job failed', details: error.message },
      { status: 500 }
    );
  }
}
