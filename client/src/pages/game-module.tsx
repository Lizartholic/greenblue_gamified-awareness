import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GameModule, UserProgress } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PhishingModule } from "@/components/phishing-module";
import { PasswordModule } from "@/components/password-module";
import { useState } from "react";

export default function GameModulePage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const moduleId = parseInt(id);

  const { data: module, isLoading: isLoadingModule } = useQuery<GameModule>({
    queryKey: [`/api/modules/${moduleId}`],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserProgress>({
    queryKey: [`/api/progress/${moduleId}`],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (updatedProgress: Partial<UserProgress>) => {
      const res = await apiRequest("PUT", `/api/progress/${moduleId}`, updatedProgress);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${moduleId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const [timerStarted, setTimerStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Start timer when component mounts
  useState(() => {
    setTimerStarted(true);
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
      // Update time spent when component unmounts
      if (progress && timeSpent > 0) {
        updateProgressMutation.mutate({
          timeSpent: progress.timeSpent + timeSpent
        });
      }
    };
  });

  if (isLoadingModule || isLoadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!module || !progress) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Module not found</h2>
            <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProgress = async (newProgress: Partial<UserProgress>) => {
    await updateProgressMutation.mutateAsync(newProgress);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => navigate("/")}
              >
                <i className="bx bx-arrow-back text-xl mr-2"></i>
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>
                  {progress.completedChallenges}/{module.totalChallenges} Challenges
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {module.type === "phishing" && (
        <PhishingModule 
          module={module} 
          progress={progress} 
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {module.type === "password" && (
        <PasswordModule 
          module={module} 
          progress={progress} 
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {module.type !== "phishing" && module.type !== "password" && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{module.title}</h2>
            <p className="text-gray-600 mb-8">{module.description}</p>
            
            <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
              <p className="text-gray-500">This module is currently under development.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
