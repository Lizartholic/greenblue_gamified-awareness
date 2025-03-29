import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailContent {
  type: string;
  text?: string;
  src?: string;
  alt?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  email: {
    from: string;
    subject: string;
    time: string;
    content: EmailContent[];
    isPhishing: boolean;
    explanation: string;
  };
}

interface EmailChallengeProps {
  challenge: Challenge;
  selectedAnswer: string | null;
  isSubmitted: boolean;
  submissionResult: any;
  isLoading: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onNextChallenge: () => void;
}

export default function EmailChallenge({
  challenge,
  selectedAnswer,
  isSubmitted,
  submissionResult,
  isLoading,
  onSelectAnswer,
  onSubmitAnswer,
  onNextChallenge
}: EmailChallengeProps) {
  return (
    <Card className="bg-white rounded-xl shadow-md overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold mb-4 font-heading">{challenge.title}</h2>
        <p className="text-gray-700 mb-6">
          {challenge.description}
        </p>
        
        <div className="border rounded-md p-4 mb-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">From: {challenge.email.from}</div>
              <div className="text-sm text-gray-600">Subject: {challenge.email.subject}</div>
            </div>
            <div className="text-sm text-gray-500">{challenge.email.time}</div>
          </div>
          <div className="space-y-4">
            {challenge.email.content.map((item, idx) => {
              if (item.type === 'logo') {
                return (
                  <div key={idx} className="flex">
                    <img src={item.src} alt={item.alt} className="h-8 mr-2" />
                  </div>
                );
              } else if (item.type === 'heading') {
                return <h3 key={idx} className="text-xl font-medium">{item.text}</h3>;
              } else if (item.type === 'paragraph') {
                return <p key={idx}>{item.text}</p>;
              } else if (item.type === 'button') {
                return (
                  <div key={idx} className="my-4 text-center">
                    <a href="#" onClick={(e) => e.preventDefault()} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium">
                      {item.text}
                    </a>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        
        {isSubmitted && submissionResult ? (
          <div className={cn(
            "p-4 mb-6 rounded-md",
            submissionResult.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          )}>
            <h3 className={cn(
              "font-medium mb-2",
              submissionResult.isCorrect ? "text-green-800" : "text-red-800"
            )}>
              {submissionResult.isCorrect ? "Correct!" : "Incorrect"}
            </h3>
            <p className={submissionResult.isCorrect ? "text-green-700" : "text-red-700"}>
              {challenge.email.explanation}
            </p>
            <div className="mt-4 text-right">
              <Button 
                onClick={onNextChallenge}
                className="bg-secondary hover:bg-secondary-dark text-white"
              >
                Next Challenge
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">Is this a legitimate email or a phishing attempt?</h3>
            <div className="flex flex-col space-y-3">
              <button 
                className={cn(
                  "w-full border rounded-md py-3 px-4 text-left hover:bg-gray-50 focus:outline-none",
                  selectedAnswer === 'legitimate' ? "border-primary ring-2 ring-primary" : "border-gray-300"
                )}
                onClick={() => onSelectAnswer('legitimate')}
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3",
                    selectedAnswer === 'legitimate' ? "border-primary" : "border-gray-300"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      selectedAnswer === 'legitimate' ? "bg-primary" : "bg-white"
                    )}></div>
                  </div>
                  <div>
                    <span className="font-medium">Legitimate Email</span>
                    <p className="text-sm text-gray-600">This is a genuine security alert.</p>
                  </div>
                </div>
              </button>
              
              <button 
                className={cn(
                  "w-full border rounded-md py-3 px-4 text-left hover:bg-gray-50 focus:outline-none",
                  selectedAnswer === 'phishing' ? "border-primary ring-2 ring-primary" : "border-gray-300"
                )}
                onClick={() => onSelectAnswer('phishing')}
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3",
                    selectedAnswer === 'phishing' ? "border-primary" : "border-gray-300"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      selectedAnswer === 'phishing' ? "bg-primary" : "bg-white"
                    )}></div>
                  </div>
                  <div>
                    <span className="font-medium">Phishing Attempt</span>
                    <p className="text-sm text-gray-600">This email is trying to steal my information.</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 text-right">
              <Button 
                onClick={onSubmitAnswer}
                disabled={!selectedAnswer || isLoading}
                className="bg-secondary hover:bg-secondary-dark text-white py-2 px-6 rounded-md"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting</>
                ) : 'Submit Answer'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
