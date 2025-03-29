import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import EmailChallenge from '@/components/game/phishing/email-challenge';

// Module challenges
const phishingChallenges = [
  {
    id: 1,
    title: 'Challenge 1: Suspicious Email',
    description: 'Review this email and identify if it\'s legitimate or a phishing attempt. Look for clues in the sender address, links, and overall message.',
    email: {
      from: 'accounts@paypa1-security.com',
      subject: 'Urgent: Your Account Has Been Limited',
      time: '10:32 AM',
      content: [
        { type: 'logo', src: '/src/assets/paypal-logo.svg', alt: 'PayPal logo' },
        { type: 'heading', text: 'PayPal Security Team' },
        { type: 'paragraph', text: 'Dear Valued Customer,' },
        { type: 'paragraph', text: 'We\'ve detected unusual activity on your PayPal account. To ensure your account security, we\'ve temporarily limited some features.' },
        { type: 'paragraph', text: 'Please verify your information immediately by clicking the button below:' },
        { type: 'button', text: 'Verify Account Now' },
        { type: 'paragraph', text: 'If you don\'t verify within 24 hours, your account will be suspended.' },
        { type: 'paragraph', text: 'Thank you for your cooperation,\nPayPal Security Team' }
      ],
      isPhishing: true,
      explanation: 'This is a phishing email. Note the misspelled sender domain (paypa1-security.com instead of paypal.com), urgent language designed to create panic, and the generic greeting. These are common tactics in phishing attempts.'
    }
  },
  // Additional challenges would be added here
];

export default function PhishingModule() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // Fetch user progress for this module
  const { data: moduleProgress } = useQuery({
    queryKey: ['/api/modules/phishing/progress'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/modules/phishing/progress');
        return await res.json();
      } catch (error) {
        // Fallback
        return { progress: 45, score: 450, completedChallenges: [] };
      }
    }
  });
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { challengeId: number, answer: string }) => {
      try {
        const res = await apiRequest('POST', '/api/modules/phishing/submit', data);
        return await res.json();
      } catch (error) {
        // Mock response
        const isCorrect = data.answer === 'phishing';
        return {
          isCorrect,
          explanation: phishingChallenges[currentChallenge].email.explanation,
          score: moduleProgress?.score || 450,
          progress: moduleProgress?.progress || 45
        };
      }
    },
    onSuccess: (data) => {
      if (data.isCorrect) {
        toast({
          title: 'Correct!',
          description: 'Good job identifying this email correctly.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Incorrect',
          description: 'That\'s not quite right. Review the explanation to learn more.',
          variant: 'destructive',
        });
      }
      setIsAnswerSubmitted(true);
      // Update progress in cache
      queryClient.setQueryData(['/api/modules/phishing/progress'], {
        ...moduleProgress,
        score: data.score,
        progress: data.progress
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit your answer. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: 'Please select an answer',
        description: 'You need to choose whether this is legitimate or phishing.',
        variant: 'destructive',
      });
      return;
    }
    
    submitAnswerMutation.mutate({
      challengeId: phishingChallenges[currentChallenge].id,
      answer: selectedAnswer
    });
  };
  
  const handleNextChallenge = () => {
    if (currentChallenge < phishingChallenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Module completed
      toast({
        title: 'Module Completed!',
        description: 'You\'ve completed the Phishing Awareness module.',
      });
      // Return to homepage
      setLocation('/');
    }
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
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <i className="fas fa-fish text-white"></i>
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground">Spot the Scam</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700">
                Score: <span className="text-orange-500">{moduleProgress?.score || 0}</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Progress: 
                <span className="inline-block w-24 h-2 bg-gray-200 rounded-full align-middle ml-1">
                  <span 
                    className="block h-2 bg-orange-500 rounded-full" 
                    style={{ width: `${moduleProgress?.progress || 0}%` }}
                  ></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {phishingChallenges[currentChallenge] && (
          <EmailChallenge 
            challenge={phishingChallenges[currentChallenge]}
            selectedAnswer={selectedAnswer}
            isSubmitted={isAnswerSubmitted}
            onSelectAnswer={handleSelectAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onNextChallenge={handleNextChallenge}
            submissionResult={submitAnswerMutation.data}
            isLoading={submitAnswerMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}
