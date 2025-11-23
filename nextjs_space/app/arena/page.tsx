
import { ArenaInterface } from './components/arena-interface';
import { prisma } from '../../lib/db';

export default async function ArenaPage() {
  // No authentication required - open platform access
  
  // Fetch initial data for the arena
  const [agents, competition, marketData] = await Promise.all([
    prisma.aIAgent.findMany({
      where: { isActive: true },
      include: {
        performances: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        trades: {
          orderBy: { entryTime: 'desc' },
          take: 5
        }
      }
    }),
    prisma.competition.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        entries: {
          include: {
            agent: true
          },
          orderBy: { rank: 'asc' }
        },
        rounds: {
          orderBy: { roundNumber: 'asc' }
        }
      }
    }),
    prisma.marketData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 6
    })
  ]);

  // Create a guest user object for public access
  const guestUser = {
    name: 'Guest',
    email: 'guest@intellitrade.xyz',
  };

  return (
    <ArenaInterface 
      initialAgents={agents}
      initialCompetition={competition}
      initialMarketData={marketData}
      user={guestUser}
    />
  );
}
