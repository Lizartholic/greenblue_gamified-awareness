import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ModuleCard } from "@/components/module-card";
import { GameModule, UserProgress } from "@shared/schema";
import { Loader2 } from "lucide-react";
import backgroundImage from "@assets/greenphoto.png";

export default function HomePage() {
  const { user } = useAuth();

  const { data: modules, isLoading: isLoadingModules } = useQuery<GameModule[]>({
    queryKey: ["/api/modules"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  if (isLoadingModules || isLoadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    );
  }

  // Calculate overall progress stats
  const completedModules = progress?.filter(p => p.isCompleted).length || 0;
  const totalModules = modules?.length || 0;
  const totalPoints = progress?.reduce((sum, p) => sum + p.points, 0) || 0;
  const totalTimeSpent = progress?.reduce((sum, p) => sum + p.timeSpent, 0) || 0; // in minutes

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Background Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-400 to-blue-500" style={{ height: "300px" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
            <div className="text-white">
              <h1 className="text-4xl font-bold font-[Poppins] mb-4">Welcome to CyberSafe</h1>
              <p className="text-lg max-w-xl">Learn essential cyber hygiene skills through interactive challenges and games.</p>
              <div className="mt-6">
                <a 
                  href="#modules" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition"
                >
                  Start Learning
                  <i className="bx bx-right-arrow-alt ml-2"></i>
                </a>
              </div>
            </div>
          </div>
          
          {/* Background image */}
          <div 
            className="absolute inset-0 z-0 opacity-20" 
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>

        {/* Progress Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="bx bx-trophy text-primary-500 text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Modules Completed</h3>
                    <p className="text-3xl font-bold text-primary-500">
                      {completedModules}<span className="text-gray-500 text-lg">/{totalModules}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="bx bx-star text-blue-500 text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Total Points</h3>
                    <p className="text-3xl font-bold text-blue-500">{totalPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="bx bx-time text-yellow-500 text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Time Spent</h3>
                    <p className="text-3xl font-bold text-yellow-500">
                      {totalTimeSpent}<span className="text-gray-500 text-lg"> min</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div id="modules">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules?.map(module => {
                const moduleProgress = progress?.find(p => p.moduleId === module.id);
                return (
                  <ModuleCard 
                    key={module.id}
                    module={module}
                    progress={moduleProgress}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start items-center">
              <i className="bx bx-shield-quarter text-primary-500 text-3xl mr-2"></i>
              <span className="font-bold text-xl font-[Poppins] text-gray-900">CyberSafe</span>
            </div>
            <p className="mt-4 md:mt-0 text-center md:text-right text-sm text-gray-500">
              © 2023 CyberSafe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
