
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ModuleCard from '@/components/game/module-card';
import { gameModules } from '@/lib/game-config';
import UserMenu from '@/components/layout/user-menu';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: progress } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user/progress');
        return await res.json();
      } catch (error) {
        return {
          overallProgress: 0,
          score: 0,
          rank: 1,
          badges: [],
          modules: {}
        };
      }
    }
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/leaderboard');
        return await res.json();
      } catch (error) {
        return [];
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground">CyberSafe</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Total Score</h3>
            <p className="text-3xl font-bold text-primary">{progress?.score || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Your Rank</h3>
            <p className="text-3xl font-bold text-secondary">#{progress?.rank || '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Badges Earned</h3>
            <div className="flex gap-2">
              {progress?.badges?.map((badge: string) => (
                <span key={badge} className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
          <div className="space-y-4">
            {leaderboard?.slice(0, 5)?.map((player: any) => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{player.rank}</span>
                  <span>{player.name}</span>
                </div>
                <span className="font-semibold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Game Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModules.map(module => (
              <ModuleCard 
                key={module.id}
                module={module}
                progress={progress?.modules?.[module.id]?.progress || 0}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
