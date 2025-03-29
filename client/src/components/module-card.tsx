import { GameModule, UserProgress } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useLocation } from "wouter";

interface ModuleCardProps {
  module: GameModule;
  progress?: UserProgress;
}

export function ModuleCard({ module, progress }: ModuleCardProps) {
  const [, navigate] = useLocation();
  
  const getProgressPercentage = () => {
    if (!progress || module.totalChallenges === 0) return 0;
    return Math.floor((progress.completedChallenges / module.totalChallenges) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-primary-100 text-primary-800';
      case 'advanced':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleGradient = (type: string) => {
    switch (type) {
      case 'phishing':
        return 'from-blue-400 to-blue-600';
      case 'password':
        return 'from-primary-400 to-primary-600';
      case 'browsing':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const handleModuleClick = () => {
    navigate(`/module/${module.id}`);
  };

  const progressPercentage = getProgressPercentage();
  const isModuleStarted = progressPercentage > 0;
  const isModuleCompleted = progress?.isCompleted || false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition transform hover:scale-[1.02]">
      <div className={`h-40 bg-gradient-to-br ${getModuleGradient(module.type)} flex items-center justify-center`}>
        <i className={`${module.iconClass} text-white text-6xl`}></i>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{module.title}</h3>
          <span className={`${getDifficultyColor(module.difficulty)} text-xs px-2 py-1 rounded-full`}>
            {module.difficulty}
          </span>
        </div>
        <p className="text-gray-600 mb-6">{module.description}</p>
        
        <ProgressIndicator 
          percentage={progressPercentage} 
        />
        
        <Button 
          className={`mt-6 w-full ${
            isModuleCompleted 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : isModuleStarted 
                ? module.type === 'phishing' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-primary-500 hover:bg-primary-600' 
                : 'bg-gray-500 hover:bg-gray-600'
          }`}
          onClick={handleModuleClick}
        >
          {isModuleCompleted 
            ? 'Review Module' 
            : isModuleStarted 
              ? 'Continue Learning' 
              : 'Start Module'}
        </Button>
      </CardContent>
    </Card>
  );
}
