import { useState } from "react";
import { GameModule, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";

interface PhishingModuleProps {
  module: GameModule;
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => Promise<void>;
}

interface PhishingChallenge {
  id: number;
  title: string;
  description: string;
  emailContent: React.ReactNode;
  suspiciousElements: string[];
  explanations: Record<string, string>;
}

export function PhishingModule({ module, progress, onUpdateProgress }: PhishingModuleProps) {
  const [, navigate] = useLocation();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    Math.min(progress.completedChallenges, module.totalChallenges - 1)
  );
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sample phishing challenges
  const phishingChallenges: PhishingChallenge[] = [
    {
      id: 1,
      title: "Spot the Banking Scam",
      description: "Examine the email below and identify the signs that indicate it might be a phishing attempt.",
      emailContent: (
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">From: support@banking-secure.net</p>
                <p>To: customer@example.com</p>
                <p>Subject: URGENT: Your Bank Account Has Been Suspended</p>
              </div>
              <div>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Yesterday</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4">Dear Valued Customer,</p>
            <p className="mb-4">We have detected suspicious activity on your bank account. Your account has been temporarily suspended for your security.</p>
            <p className="mb-4">Please click on the link below to verify your identity and restore access to your account.</p>
            <div className="mb-4">
              <a href="#" className="text-blue-600 underline">http://secure-banking-verification.com/verify</a>
            </div>
            <p className="mb-4">If you do not verify your account within 24 hours, your account will be permanently closed.</p>
            <p className="mb-4">Thank you for your cooperation.</p>
            <p>Security Team</p>
          </div>
        </div>
      ),
      suspiciousElements: [
        "The sender's email domain (banking-secure.net)",
        "The urgent tone and threat",
        "The suspicious link URL",
        "Generic greeting (Dear Valued Customer)",
        "The request to click a link to verify identity"
      ],
      explanations: {
        "The sender's email domain (banking-secure.net)": "Legitimate banks use their official domain names (like bankofamerica.com) not generic domains.",
        "The urgent tone and threat": "Scammers create urgency to make you act without thinking.",
        "The suspicious link URL": "The URL doesn't match the official bank website.",
        "Generic greeting (Dear Valued Customer)": "Legitimate banks usually address you by name.",
        "The request to click a link to verify identity": "Banks typically don't ask you to verify your identity through email links."
      }
    },
    {
      id: 2,
      title: "Email Phishing Attempt",
      description: "Examine the email below and identify the signs that indicate it might be a phishing attempt.",
      emailContent: (
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">From: amazonsupport@amazom-support.net</p>
                <p>To: user@example.com</p>
                <p>Subject: URGENT: Your Amazon account has been locked</p>
              </div>
              <div>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Yesterday</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4">Dear Valued Customer,</p>
            <p className="mb-4">We have detected unusual activity on your Amazon account. Your account has been temporarily locked for security reasons.</p>
            <p className="mb-4">Please click on the link below to verify your identity and restore access to your account.</p>
            <div className="mb-4">
              <a href="#" className="text-blue-600 underline">http://amazon-account-verify.com/restore-access</a>
            </div>
            <p className="mb-4">If you do not verify your account within 24 hours, your account will be permanently deleted.</p>
            <p className="mb-4">Thank you for your cooperation.</p>
            <p>Amazon Customer Support Team</p>
          </div>
        </div>
      ),
      suspiciousElements: [
        "The sender's email domain (amazom-support.net)",
        "The urgent tone and threat",
        "The suspicious link URL",
        "Spelling error in 'amazom-support'",
        "Generic greeting (Dear Valued Customer)"
      ],
      explanations: {
        "The sender's email domain (amazom-support.net)": "Amazon emails come from amazon.com domains, not third-party domains.",
        "The urgent tone and threat": "The threat of account deletion is designed to cause panic and immediate action.",
        "The suspicious link URL": "The link doesn't go to amazon.com but a phishing site.",
        "Spelling error in 'amazom-support'": "Legitimate companies proofread their emails. Spelling errors are common in phishing attempts.",
        "Generic greeting (Dear Valued Customer)": "Amazon typically addresses you by name in emails."
      }
    },
    {
      id: 3,
      title: "Social Media Alert",
      description: "Review this message and identify suspicious elements that indicate it might be a scam.",
      emailContent: (
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">From: security@facebooks-alerts.com</p>
                <p>To: user@example.com</p>
                <p>Subject: Your Facebook account will be disabled soon</p>
              </div>
              <div>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Today</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4">Hello Facebook User,</p>
            <p className="mb-4">Your account has violated our community guidelines and will be disabled in the next 24 hours. If you believe this is an error, please verify your account by confirming your password.</p>
            <div className="mb-4 p-3 border border-gray-300 rounded">
              <p className="font-medium mb-2">Login to continue:</p>
              <div className="mb-2">
                <label className="block text-sm text-gray-700">Email:</label>
                <input type="text" className="border border-gray-300 rounded px-2 py-1 w-full" placeholder="Enter your email" />
              </div>
              <div className="mb-2">
                <label className="block text-sm text-gray-700">Password:</label>
                <input type="password" className="border border-gray-300 rounded px-2 py-1 w-full" placeholder="Enter your password" />
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">Confirm Account</button>
            </div>
            <p className="mb-4">Ignoring this message will result in permanent account deletion.</p>
            <p>Facebook Security Team</p>
          </div>
        </div>
      ),
      suspiciousElements: [
        "The sender's domain (facebooks-alerts.com)",
        "Generic greeting (Hello Facebook User)",
        "Request for login credentials in the email",
        "Threatening tone about account deletion",
        "No official Facebook branding or logos"
      ],
      explanations: {
        "The sender's domain (facebooks-alerts.com)": "Facebook only sends emails from facebook.com domains.",
        "Generic greeting (Hello Facebook User)": "Facebook knows your name and uses it in communications.",
        "Request for login credentials in the email": "Legitimate services never ask for your password via email.",
        "Threatening tone about account deletion": "Creates urgency to panic users into taking immediate action.",
        "No official Facebook branding or logos": "Official communications include proper branding elements."
      }
    },
    {
      id: 4,
      title: "Lottery Winner Notification",
      description: "Review this email and identify elements that suggest it's a scam.",
      emailContent: (
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">From: international.lottery@winner-notification.org</p>
                <p>To: undisclosed-recipients</p>
                <p>Subject: CONGRATULATIONS: YOU HAVE WON $5,500,000.00!!!</p>
              </div>
              <div>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">3 days ago</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4 font-bold text-xl">CONGRATULATIONS!!!</p>
            <p className="mb-4">Your email address has been selected as a winner of the INTERNATIONAL EMAIL LOTTERY PROGRAM held on 15th June 2023. Your email was chosen from over 250 million email addresses worldwide.</p>
            <p className="mb-4">You have won the sum of $5,500,000.00 (Five Million Five Hundred Thousand United States Dollars).</p>
            <p className="mb-4">To claim your prize, please contact our claims agent immediately:</p>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p>Name: Dr. James Williams</p>
              <p>Email: james.williams@claimsagent.net</p>
              <p>Phone: +44 7700 900123</p>
            </div>
            <p className="mb-4">You need to provide the following information:</p>
            <ul className="list-disc ml-5 mb-4">
              <li>Full Name</li>
              <li>Address</li>
              <li>Phone Number</li>
              <li>Copy of ID</li>
              <li>Bank Account Details for Transfer</li>
            </ul>
            <p className="mb-4">A processing fee of $99 is required to release your funds.</p>
            <p>Regards,<br/>International Lottery Commission</p>
          </div>
        </div>
      ),
      suspiciousElements: [
        "You won a lottery you never entered",
        "Excessive use of capital letters and exclamation points",
        "Request for personal and banking information",
        "Processing fee required to claim prize",
        "Sent to undisclosed-recipients"
      ],
      explanations: {
        "You won a lottery you never entered": "Legitimate lotteries require you to buy a ticket; you can't win a lottery you didn't enter.",
        "Excessive use of capital letters and exclamation points": "Professional organizations use proper formatting in their communications.",
        "Request for personal and banking information": "Scammers collect this information for identity theft.",
        "Processing fee required to claim prize": "Legitimate lotteries never require upfront fees to claim winnings.",
        "Sent to undisclosed-recipients": "Mass-sent emails are a red flag; legitimate winning notifications are personalized."
      }
    },
    {
      id: 5,
      title: "Tech Support Alert",
      description: "Review this message and identify suspicious elements that indicate it might be a scam.",
      emailContent: (
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">From: microsoft-support@tech-alerts.org</p>
                <p>To: user@example.com</p>
                <p>Subject: CRITICAL VIRUS ALERT: Your Computer Has Been Infected</p>
              </div>
              <div>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">1 hour ago</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4">ATTENTION WINDOWS USER:</p>
            <p className="mb-4">Our security system has detected dangerous virus activity on your computer. Your personal information and banking details are at risk of being stolen.</p>
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
              <p className="font-bold">THREAT DETECTED:</p>
              <p>Multiple malware instances found: Trojan.Win32.BlackEnergy</p>
              <p>System scan: 39 infected files found</p>
            </div>
            <p className="mb-4">You must take immediate action to protect your data. Call our Microsoft Certified technicians now:</p>
            <p className="mb-4 text-center font-bold text-lg">+1 (888) 123-4567</p>
            <p className="mb-4">Alternatively, download our security tool by clicking the button below:</p>
            <div className="mb-4 text-center">
              <button className="bg-green-500 text-white px-6 py-2 rounded font-bold">REMOVE VIRUS NOW</button>
            </div>
            <p className="text-sm text-gray-500">Microsoft Windows Security Team</p>
          </div>
        </div>
      ),
      suspiciousElements: [
        "The sender's domain (tech-alerts.org) is not Microsoft",
        "Alarming language designed to create panic",
        "Phone number claiming to be Microsoft support",
        "Request to download security software",
        "Unprofessional formatting and ALL CAPS text"
      ],
      explanations: {
        "The sender's domain (tech-alerts.org) is not Microsoft": "Microsoft only sends security alerts from microsoft.com domains.",
        "Alarming language designed to create panic": "Scammers use fear tactics to prevent you from thinking critically.",
        "Phone number claiming to be Microsoft support": "Microsoft doesn't proactively call customers about individual computer infections.",
        "Request to download security software": "This would likely install malware, not remove it.",
        "Unprofessional formatting and ALL CAPS text": "Microsoft communications are professionally designed and formatted."
      }
    }
  ];

  const currentChallenge = phishingChallenges[currentChallengeIndex];

  const handleCheckboxChange = (element: string) => {
    setSelectedElements(prev => 
      prev.includes(element)
        ? prev.filter(item => item !== element)
        : [...prev, element]
    );
  };

  const handleSubmitAnswer = async () => {
    // Calculate score based on correct answers
    const correctElements = currentChallenge.suspiciousElements;
    const correctCount = selectedElements.filter(element => 
      correctElements.includes(element)
    ).length;
    
    // Check if the user got at least 80% of the answers correct
    const isAnswerCorrect = correctCount >= Math.ceil(correctElements.length * 0.8);
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    // Update progress if correct
    if (isAnswerCorrect && currentChallengeIndex >= progress.completedChallenges) {
      const updatedProgress = {
        completedChallenges: currentChallengeIndex + 1,
        points: progress.points + 50, // 50 points per challenge
        isCompleted: currentChallengeIndex + 1 >= module.totalChallenges
      };
      
      await onUpdateProgress(updatedProgress);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < phishingChallenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setSelectedElements([]);
      setShowResult(false);
    } else {
      // All challenges completed, return to dashboard
      navigate('/');
    }
  };

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1);
      setSelectedElements([]);
      setShowResult(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Challenge {currentChallengeIndex + 1}: {currentChallenge.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {currentChallenge.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentChallenge.emailContent}
          
          {showResult ? (
            <Alert variant={isCorrect ? "success" : "destructive"} className="mb-6">
              <div className="flex items-center">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <AlertTitle>
                  {isCorrect ? "Great job!" : "Try again!"}
                </AlertTitle>
              </div>
              <AlertDescription>
                {isCorrect 
                  ? "You correctly identified the phishing elements." 
                  : "You missed some important phishing indicators."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-2">Select all the suspicious elements in this message:</p>
              <div className="space-y-2">
                {currentChallenge.suspiciousElements.map((element) => (
                  <div key={element} className="flex items-start">
                    <Checkbox 
                      id={element} 
                      checked={selectedElements.includes(element)}
                      onCheckedChange={() => handleCheckboxChange(element)}
                    />
                    <label htmlFor={element} className="ml-2 text-sm text-gray-700">
                      {element}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showResult && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Explanation:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {currentChallenge.suspiciousElements.map(element => (
                    <li key={element}>
                      <span className="font-medium">{element}</span>: {currentChallenge.explanations[element]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousChallenge}
            disabled={currentChallengeIndex === 0}
          >
            Previous Challenge
          </Button>
          
          {showResult ? (
            <Button 
              onClick={handleNextChallenge} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              {currentChallengeIndex < phishingChallenges.length - 1 
                ? "Next Challenge" 
                : "Finish Module"}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitAnswer} 
              className="bg-blue-500 hover:bg-blue-600"
              disabled={selectedElements.length === 0}
            >
              Submit Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
