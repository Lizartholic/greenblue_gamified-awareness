import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface ModuleProps {
  module: {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    bgGradient: string;
    duration: string;
    path: string;
    disabled?: boolean;
    coverImage: string;
    difficulty: string;
    scenarios: Array<{
      id: number;
      title: string;
      description: string;
    }>;
  };
  progress: number;
}

export default function ModuleCard({ module, progress }: ModuleProps) {
  const [, setLocation] = useLocation();
  
  const handleStartModule = () => {
    if (!module.disabled && module.path) {
      setLocation(module.path);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 relative overflow-hidden">
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
          {module.difficulty}
        </span>
        <div className={`absolute inset-0 bg-gradient-to-br ${module.bgGradient}`}></div>
        <img 
          src={module.coverImage}
          alt={`${module.title} challenge`} 
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm">
          <i className={`fas ${module.icon} ${module.iconColor}`}></i>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground font-heading mb-1" dangerouslySetInnerHTML={{ __html: module.title }}></h3>
        <p className="text-gray-600 text-sm mb-4">{module.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <i className="fas fa-clock"></i>
            <span>{module.duration}</span>
          </div>
          {module.disabled ? (
            <Button 
              disabled 
              className="bg-gray-200 text-gray-500 py-2 px-4 rounded-md text-sm cursor-not-allowed"
            >
              Coming Soon
            </Button>
          ) : (
            <Button 
              onClick={handleStartModule}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-md text-sm"
            >
              Start Challenge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
