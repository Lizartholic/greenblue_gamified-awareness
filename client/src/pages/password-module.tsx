import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import StrengthChecker from '@/components/game/password/strength-checker';

export default function PasswordModule() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  
  // Fetch user progress for this module
  const { data: moduleProgress } = useQuery({
    queryKey: ['/api/modules/password/progress'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/modules/password/progress');
        return await res.json();
      } catch (error) {
        // Fallback for demo purposes
        return { progress: 60, score: 320, completedChallenges: [] };
      }
    }
  });
  
  // Password strength check
  const passwordStrengthMutation = useMutation({
    mutationFn: async (password: string) => {
      try {
        const res = await apiRequest('POST', '/api/modules/password/check', { password });
        return await res.json();
      } catch (error) {
        // Calculate strength locally as fallback
        let strength = 0;
        const requirements = {
          length: password.length >= 12,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
          number: /[0-9]/.test(password),
          special: /[^A-Za-z0-9]/.test(password),
          notCommon: password.length >= 8 && !/^(password|123456|qwerty)/.test(password)
        };
        
        if (requirements.length) strength += 20;
        if (requirements.uppercase) strength += 20;
        if (requirements.lowercase) strength += 20;
        if (requirements.number) strength += 20;
        if (requirements.special) strength += 20;
        
        return {
          strength,
          requirements,
          strengthText: strength < 20 ? 'Very Weak' : 
                         strength < 40 ? 'Weak' : 
                         strength < 60 ? 'Moderate' : 
                         strength < 80 ? 'Strong' : 
                         'Very Strong',
        };
      }
    }
  });
  
  // Submit password mutation
  const submitPasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      try {
        const res = await apiRequest('POST', '/api/modules/password/submit', data);
        return await res.json();
      } catch (error) {
        // Mock response for demo
        const strength = passwordStrengthMutation.data?.strength || 0;
        return {
          success: strength >= 80,
          score: strength >= 80 ? (moduleProgress?.score || 0) + 100 : moduleProgress?.score,
          progress: strength >= 80 ? (moduleProgress?.progress || 0) + 10 : moduleProgress?.progress,
          message: strength >= 80 ? 
            'Excellent! Your password is very strong and follows best practices.' : 
            'Your password doesn\'t meet all the security requirements. Try making it stronger.'
        };
      }
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Success!' : 'Password not strong enough',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
      
      setPasswordSubmitted(true);
      
      // Update progress in cache
      if (data.success) {
        queryClient.setQueryData(['/api/modules/password/progress'], {
          ...moduleProgress,
          score: data.score,
          progress: data.progress
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit your password. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    passwordStrengthMutation.mutate(newPassword);
  };
  
  const handleSubmitPassword = () => {
    if (!password) {
      toast({
        title: 'Password required',
        description: 'Please enter a password to test.',
        variant: 'destructive',
      });
      return;
    }
    
    submitPasswordMutation.mutate({ password });
  };
  
  const handleNextChallenge = () => {
    // Reset for a new challenge or return to homepage if done
    setPassword('');
    setPasswordSubmitted(false);
    toast({
      title: 'Challenge Completed',
      description: 'Moving on to the next challenge...',
    });
    
    // For now, just return to homepage
    setLocation('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                className="text-gray-600 hover:text-gray-900 mr-1" 
                onClick={() => setLocation('/')}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <i className="fas fa-key text-white"></i>
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground">Password Challenge</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700">
                Score: <span className="text-teal-500">{moduleProgress?.score || 0}</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Progress: 
                <span className="inline-block w-24 h-2 bg-gray-200 rounded-full align-middle ml-1">
                  <span 
                    className="block h-2 bg-teal-500 rounded-full" 
                    style={{ width: `${moduleProgress?.progress || 0}%` }}
                  ></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4 font-heading">Challenge 3: Create a Strong Password</h2>
            <p className="text-gray-700 mb-6">
              Create a strong, memorable password that meets all the security requirements listed below.
            </p>
            
            <StrengthChecker 
              password={password}
              onPasswordChange={handlePasswordChange}
              strengthData={passwordStrengthMutation.data}
              isSubmitted={passwordSubmitted}
              onSubmit={handleSubmitPassword}
              onNextChallenge={handleNextChallenge}
              result={submitPasswordMutation.data}
              isLoading={submitPasswordMutation.isPending || passwordStrengthMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
