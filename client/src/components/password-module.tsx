import { useState } from "react";
import { GameModule, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

interface PasswordModuleProps {
  module: GameModule;
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => Promise<void>;
}

interface PasswordChallenge {
  id: number;
  title: string;
  description: string;
  type: "strength" | "identify" | "create" | "test";
  content: React.ReactNode;
  checkAnswer: (answer: any) => boolean;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export function PasswordModule({ module, progress, onUpdateProgress }: PasswordModuleProps) {
  const [, navigate] = useLocation();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    Math.min(progress.completedChallenges, module.totalChallenges - 1)
  );
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedPasswords, setSelectedPasswords] = useState<string[]>([]);
  const [userCreatedPassword, setUserCreatedPassword] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 10;
    
    // Character types check
    if (/[A-Z]/.test(pwd)) strength += 20; // Uppercase
    if (/[a-z]/.test(pwd)) strength += 15; // Lowercase
    if (/[0-9]/.test(pwd)) strength += 15; // Numbers
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 20; // Special characters
    
    // Bonus for combination
    const hasTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(pwd)).length;
    if (hasTypes >= 3) strength += 10;
    if (hasTypes === 4) strength += 10;
    
    // Common patterns check (reduce strength)
    if (/^123|abc|qwerty|password|admin|user/i.test(pwd)) strength -= 20;
    if (/(.)\1{2,}/.test(pwd)) strength -= 10; // Repeated characters
    
    return Math.max(0, Math.min(100, strength));
  };

  // Password strength color
  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  // Password strength text
  const getStrengthText = (strength: number): string => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Moderate";
    if (strength < 80) return "Strong";
    return "Very Strong";
  };

  // Sample password challenges
  const passwordChallenges: PasswordChallenge[] = [
    {
      id: 1,
      title: "Password Strength Basics",
      description: "Test different passwords to understand what makes a password strong.",
      type: "strength",
      content: (
        <div>
          <p className="mb-4">Try entering different passwords to see how their strength is evaluated:</p>
          
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Enter a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
              className="mb-2"
            />
            
            <div className="mb-2">
              <Progress value={passwordStrength} className={`h-2 ${getStrengthColor(passwordStrength)}`} />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={`font-medium ${
                passwordStrength < 30 ? "text-red-500" : 
                passwordStrength < 60 ? "text-yellow-500" :
                passwordStrength < 80 ? "text-blue-500" : "text-green-500"
              }`}>
                {getStrengthText(passwordStrength)}
              </span>
              <span>{passwordStrength}%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2">What makes a strong password?</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                At least 12 characters long
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Mix of uppercase and lowercase letters
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Include numbers
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Include special characters (!, @, #, $, etc.)
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                Avoid personal information (names, birthdays)
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                Avoid common words or patterns
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Try these examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => {
                setPassword("password123");
                setPasswordStrength(calculatePasswordStrength("password123"));
              }}>
                password123
              </Button>
              <Button variant="outline" onClick={() => {
                setPassword("P@ssw0rd!");
                setPasswordStrength(calculatePasswordStrength("P@ssw0rd!"));
              }}>
                P@ssw0rd!
              </Button>
              <Button variant="outline" onClick={() => {
                setPassword("iLove2Play$occer");
                setPasswordStrength(calculatePasswordStrength("iLove2Play$occer"));
              }}>
                iLove2Play$occer
              </Button>
              <Button variant="outline" onClick={() => {
                setPassword("Tr!p0d-W4lk1ng-F1$h");
                setPasswordStrength(calculatePasswordStrength("Tr!p0d-W4lk1ng-F1$h"));
              }}>
                Tr!p0d-W4lk1ng-F1$h
              </Button>
            </div>
          </div>
        </div>
      ),
      checkAnswer: () => passwordStrength >= 80,
      feedback: {
        correct: "Great job! You've learned how to evaluate password strength.",
        incorrect: "Try creating a password with a strength of at least 80%."
      }
    },
    {
      id: 2,
      title: "Identify Weak Passwords",
      description: "Can you spot which of these passwords are vulnerable?",
      type: "identify",
      content: (
        <div>
          <p className="mb-4">Select all the passwords that you think are weak or vulnerable:</p>
          
          <div className="space-y-2 mb-6">
            {[
              "Fluffy2010",
              "P@$$w0rd123!",
              "87654321",
              "kF7!tR9*qE2&",
              "qwertyuiop",
              "January1990",
              "R4nd0m-Ph@$3-C0rrect-H0r$e",
              "adminadmin"
            ].map(pwd => (
              <div key={pwd} className="flex items-center">
                <Checkbox 
                  id={pwd} 
                  checked={selectedPasswords.includes(pwd)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPasswords(prev => [...prev, pwd]);
                    } else {
                      setSelectedPasswords(prev => prev.filter(p => p !== pwd));
                    }
                  }}
                />
                <label htmlFor={pwd} className="ml-2 text-sm font-medium">
                  {pwd}
                </label>
              </div>
            ))}
          </div>
          
          {showResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Explanation:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">Fluffy2010</span>: Likely contains pet name and year, which are personal information and easy to guess.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 font-bold mr-2">⚠</span>
                  <div>
                    <span className="font-medium">P@$$w0rd123!</span>: Common substitutions on the word "password" are well-known to hackers.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">87654321</span>: Simple sequential numbers are very easy to crack.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">kF7!tR9*qE2&</span>: Strong - a mix of random characters.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">qwertyuiop</span>: Keyboard pattern that is extremely common and easy to guess.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">January1990</span>: Contains month and year, likely a birth year.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">R4nd0m-Ph@$3-C0rrect-H0r$e</span>: Strong - long passphrase with substitutions.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">adminadmin</span>: Repetition of common word, extremely weak.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      ),
      checkAnswer: (selected) => {
        const weakPasswords = ["Fluffy2010", "P@$$w0rd123!", "87654321", "qwertyuiop", "January1990", "adminadmin"];
        const correctCount = selected.filter(pwd => weakPasswords.includes(pwd)).length;
        const incorrectCount = selected.filter(pwd => !weakPasswords.includes(pwd)).length;
        
        // At least 5 correct and no more than 1 incorrect
        return correctCount >= 5 && incorrectCount <= 1;
      },
      feedback: {
        correct: "Good job! You've correctly identified most of the weak passwords.",
        incorrect: "Review what makes passwords weak and try again. Look for common patterns, personal information, and simple sequences."
      }
    },
    {
      id: 3,
      title: "Create a Strong Password",
      description: "Put your knowledge to practice by creating a strong password.",
      type: "create",
      content: (
        <div>
          <p className="mb-4">Create a strong password that meets all the criteria:</p>
          
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Create your password"
              value={userCreatedPassword}
              onChange={(e) => {
                setUserCreatedPassword(e.target.value);
              }}
              className="mb-2"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className={`p-2 rounded border ${userCreatedPassword.length >= 12 ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <div className="flex items-center">
                  {userCreatedPassword.length >= 12 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm">At least 12 characters</span>
                </div>
              </div>
              
              <div className={`p-2 rounded border ${/[A-Z]/.test(userCreatedPassword) ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <div className="flex items-center">
                  {/[A-Z]/.test(userCreatedPassword) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm">Uppercase letters</span>
                </div>
              </div>
              
              <div className={`p-2 rounded border ${/[a-z]/.test(userCreatedPassword) ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <div className="flex items-center">
                  {/[a-z]/.test(userCreatedPassword) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm">Lowercase letters</span>
                </div>
              </div>
              
              <div className={`p-2 rounded border ${/[0-9]/.test(userCreatedPassword) ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <div className="flex items-center">
                  {/[0-9]/.test(userCreatedPassword) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm">Numbers</span>
                </div>
              </div>
              
              <div className={`p-2 rounded border ${/[^A-Za-z0-9]/.test(userCreatedPassword) ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <div className="flex items-center">
                  {/[^A-Za-z0-9]/.test(userCreatedPassword) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm">Special characters</span>
                </div>
              </div>
              
              <div className={`p-2 rounded border ${!/password|123456|qwerty|admin/i.test(userCreatedPassword) ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                <div className="flex items-center">
                  {!/password|123456|qwerty|admin/i.test(userCreatedPassword) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="text-sm">No common words/patterns</span>
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-sm font-medium mb-1">Estimated strength:</p>
              <Progress value={calculatePasswordStrength(userCreatedPassword)} className={`h-2 ${getStrengthColor(calculatePasswordStrength(userCreatedPassword))}`} />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={`font-medium ${
                calculatePasswordStrength(userCreatedPassword) < 30 ? "text-red-500" : 
                calculatePasswordStrength(userCreatedPassword) < 60 ? "text-yellow-500" :
                calculatePasswordStrength(userCreatedPassword) < 80 ? "text-blue-500" : "text-green-500"
              }`}>
                {getStrengthText(calculatePasswordStrength(userCreatedPassword))}
              </span>
              <span>{calculatePasswordStrength(userCreatedPassword)}%</span>
            </div>
          </div>
          
          {showResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Tips for creating memorable strong passwords:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">1.</span>
                  <div>
                    <span className="font-medium">Use passphrases</span>: Combine multiple words with numbers and symbols (e.g., Elephant-7-Banana-!).
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">2.</span>
                  <div>
                    <span className="font-medium">Create acronyms</span>: Take the first letter of each word in a sentence (e.g., "I love to play basketball with friends on Saturdays" becomes "Il2pbwfoS").
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">3.</span>
                  <div>
                    <span className="font-medium">Use substitutions</span>: Replace letters with similar-looking numbers or symbols (e.g., "password" becomes "p@$$w0rd").
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">4.</span>
                  <div>
                    <span className="font-medium">Consider a password manager</span>: Use software to generate and store complex passwords securely.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      ),
      checkAnswer: (pwd) => {
        const strength = calculatePasswordStrength(pwd);
        return strength >= 80;
      },
      feedback: {
        correct: "Excellent! You've created a strong password that would be difficult to crack.",
        incorrect: "Your password doesn't meet all the security criteria. Try to make it longer and more complex."
      }
    },
    {
      id: 4,
      title: "Password Use Scenarios",
      description: "Learn when to use different types of passwords.",
      type: "test",
      content: (
        <div>
          <p className="mb-6">Different accounts require different security levels. For each scenario, move the slider to indicate how strong the password should be:</p>
          
          <div className="space-y-6 mb-6">
            <div>
              <p className="font-medium mb-2">1. Personal email account</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-16">Weak</span>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  className="mx-4" 
                  id="email-slider"
                />
                <span className="text-sm text-gray-500 w-16">Strong</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">2. Banking or financial accounts</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-16">Weak</span>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  className="mx-4" 
                  id="banking-slider"
                />
                <span className="text-sm text-gray-500 w-16">Strong</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">3. Social media accounts</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-16">Weak</span>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  className="mx-4" 
                  id="social-slider"
                />
                <span className="text-sm text-gray-500 w-16">Strong</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">4. Work or business accounts</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-16">Weak</span>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  className="mx-4" 
                  id="work-slider"
                />
                <span className="text-sm text-gray-500 w-16">Strong</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">5. Non-sensitive website requiring registration</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-16">Weak</span>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  className="mx-4" 
                  id="nonsensitive-slider"
                />
                <span className="text-sm text-gray-500 w-16">Strong</span>
              </div>
            </div>
          </div>
          
          {showResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Best practices for different accounts:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">1.</span>
                  <div>
                    <span className="font-medium">Personal email account</span>: Use a very strong password (90-100). Your email is often the recovery method for other accounts.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">2.</span>
                  <div>
                    <span className="font-medium">Banking or financial accounts</span>: Use the strongest possible passwords (95-100) and enable two-factor authentication.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">3.</span>
                  <div>
                    <span className="font-medium">Social media accounts</span>: Use strong passwords (75-85) since these can be used for identity theft.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">4.</span>
                  <div>
                    <span className="font-medium">Work or business accounts</span>: Use very strong passwords (85-95) since these may provide access to sensitive company data.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">5.</span>
                  <div>
                    <span className="font-medium">Non-sensitive websites</span>: Use moderately strong passwords (60-75), but NEVER reuse passwords from important accounts.
                  </div>
                </li>
              </ul>
              
              <div className="mt-4 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Pro tip:</span> Consider using a password manager to generate and store unique, strong passwords for each account.
                </p>
              </div>
            </div>
          )}
        </div>
      ),
      checkAnswer: () => true, // Auto-pass this informational challenge
      feedback: {
        correct: "Great! Now you understand how to prioritize password strength for different types of accounts.",
        incorrect: ""
      }
    },
    {
      id: 5,
      title: "Password Security Best Practices",
      description: "Test your knowledge of password security beyond just creating strong passwords.",
      type: "test",
      content: (
        <div>
          <p className="mb-4">Select all the statements that represent good password security practices:</p>
          
          <div className="space-y-2 mb-6">
            {[
              "Change your passwords every 30-90 days for important accounts",
              "Use the same password for multiple accounts to make it easier to remember",
              "Write down your passwords and keep them near your computer",
              "Use two-factor authentication when available",
              "Share your password with trusted friends when necessary",
              "Use a reputable password manager",
              "Check if your accounts have been involved in data breaches",
              "Answer security questions with easily discoverable information"
            ].map(practice => (
              <div key={practice} className="flex items-center">
                <Checkbox 
                  id={practice} 
                  checked={selectedPasswords.includes(practice)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPasswords(prev => [...prev, practice]);
                    } else {
                      setSelectedPasswords(prev => prev.filter(p => p !== practice));
                    }
                  }}
                />
                <label htmlFor={practice} className="ml-2 text-sm">
                  {practice}
                </label>
              </div>
            ))}
          </div>
          
          {showResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Password security best practices explained:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">Change your passwords every 30-90 days for important accounts</span>: Regular password changes help minimize the impact of undetected breaches.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">Use the same password for multiple accounts</span>: This is dangerous because if one account is compromised, all your accounts are vulnerable.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">Write down your passwords and keep them near your computer</span>: This makes it easy for anyone with physical access to your workspace to steal your passwords.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">Use two-factor authentication when available</span>: This adds an extra layer of security beyond just passwords.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">Share your password with trusted friends when necessary</span>: Never share passwords, even with people you trust.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">Use a reputable password manager</span>: Password managers help generate and store strong, unique passwords securely.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <div>
                    <span className="font-medium">Check if your accounts have been involved in data breaches</span>: Services like Have I Been Pwned can alert you if your credentials have been compromised.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">✗</span>
                  <div>
                    <span className="font-medium">Answer security questions with easily discoverable information</span>: Use fabricated answers for security questions that only you would know.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      ),
      checkAnswer: (selected) => {
        const goodPractices = [
          "Change your passwords every 30-90 days for important accounts",
          "Use two-factor authentication when available",
          "Use a reputable password manager",
          "Check if your accounts have been involved in data breaches"
        ];
        
        const correctCount = selected.filter(practice => goodPractices.includes(practice)).length;
        const incorrectCount = selected.filter(practice => !goodPractices.includes(practice)).length;
        
        // At least 3 correct and no more than 1 incorrect
        return correctCount >= 3 && incorrectCount <= 1;
      },
      feedback: {
        correct: "Well done! You understand password security best practices beyond just creating strong passwords.",
        incorrect: "Review the password security best practices and try again. Focus on what practices enhance security versus those that compromise it."
      }
    }
  ];

  const currentChallenge = passwordChallenges[currentChallengeIndex];

  const handleSubmitAnswer = async () => {
    let answer;
    switch (currentChallenge.type) {
      case "strength":
        answer = password;
        break;
      case "identify":
      case "test":
        answer = selectedPasswords;
        break;
      case "create":
        answer = userCreatedPassword;
        break;
      default:
        answer = null;
    }
    
    const correct = currentChallenge.checkAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    
    // Update progress if correct
    if (correct && currentChallengeIndex >= progress.completedChallenges) {
      const updatedProgress = {
        completedChallenges: currentChallengeIndex + 1,
        points: progress.points + 50, // 50 points per challenge
        isCompleted: currentChallengeIndex + 1 >= module.totalChallenges
      };
      
      await onUpdateProgress(updatedProgress);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < passwordChallenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setPassword("");
      setPasswordStrength(0);
      setSelectedPasswords([]);
      setUserCreatedPassword("");
      setShowResult(false);
    } else {
      // All challenges completed, return to dashboard
      navigate('/');
    }
  };

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1);
      setPassword("");
      setPasswordStrength(0);
      setSelectedPasswords([]);
      setUserCreatedPassword("");
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
          {currentChallenge.content}
          
          {showResult && (
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
                  ? currentChallenge.feedback.correct
                  : currentChallenge.feedback.incorrect}
              </AlertDescription>
            </Alert>
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
              className="bg-primary-500 hover:bg-primary-600"
            >
              {currentChallengeIndex < passwordChallenges.length - 1 
                ? "Next Challenge" 
                : "Finish Module"}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitAnswer} 
              className="bg-primary-500 hover:bg-primary-600"
            >
              Submit Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
