// app/page.tsx
import { unstable_cache } from 'next/cache';

const getTodayMatches = unstable_cache(
  async () => {
    return db.query.matches.findMany({
      where: gte(matches.matchDate, startOfDay(new Date())),
      with: { predictions: true, homeTeam: true, awayTeam: true },
      orderBy: matches.matchDate
    });
  },
  ['today-matches'],
  { revalidate: 1800 } // 30 minutes
);
