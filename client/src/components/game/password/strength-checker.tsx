import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrengthCheckerProps {
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  strengthData: any;
  isSubmitted: boolean;
  onSubmit: () => void;
  onNextChallenge: () => void;
  result: any;
  isLoading: boolean;
}

export default function StrengthChecker({
  password,
  onPasswordChange,
  strengthData,
  isSubmitted,
  onSubmit,
  onNextChallenge,
  result,
  isLoading
}: StrengthCheckerProps) {
  const requirements = strengthData?.requirements || {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    notCommon: false,
  };
  
  const strength = strengthData?.strength || 0;
  const strengthClass = 
    strength < 20 ? 'bg-red-500' : 
    strength < 40 ? 'bg-red-400' :
    strength < 60 ? 'bg-yellow-500' :
    strength < 80 ? 'bg-yellow-400' :
    'bg-green-500';
  
  const strengthText = strengthData?.strengthText || 'Very Weak';
  
  return (
    <>
      <div className="mb-6">
        <label htmlFor="test-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <Input 
          type="text" 
          id="test-password" 
          value={password}
          onChange={onPasswordChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
          placeholder="Enter a password to test"
          disabled={isSubmitted || isLoading}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-3">Password Requirements:</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.length ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>At least 12 characters long</span>
          </li>
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.uppercase ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>Contains uppercase letters</span>
          </li>
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.lowercase ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>Contains lowercase letters</span>
          </li>
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.number ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>Contains at least one number</span>
          </li>
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.special ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>Contains at least one special character (!@#$%^&*)</span>
          </li>
          <li className="flex items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center mr-2",
              requirements.notCommon ? "bg-teal-500" : "bg-gray-200"
            )}>
              <i className="fas fa-check text-xs text-white"></i>
            </div>
            <span>Not a commonly used password</span>
          </li>
        </ul>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Password Strength:</h3>
          <span className="text-gray-500">{strengthText}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-2 ${strengthClass} rounded-full`} 
            style={{ width: `${strength}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Very Weak</span>
          <span className="text-xs text-gray-500">Weak</span>
          <span className="text-xs text-gray-500">Moderate</span>
          <span className="text-xs text-gray-500">Strong</span>
          <span className="text-xs text-gray-500">Very Strong</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-1 text-blue-700">Password Tip:</h3>
        <p className="text-blue-600 text-sm">
          Try using a passphrase - a series of random words with special characters and numbers mixed in. 
          Example: correct-horse-battery-staple-42!
        </p>
      </div>
      
      {isSubmitted && result ? (
        <div className={cn(
          "p-4 mb-6 rounded-md",
          result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        )}>
          <h3 className={cn(
            "font-medium mb-2",
            result.success ? "text-green-800" : "text-red-800"
          )}>
            {result.success ? "Success!" : "Not quite there yet"}
          </h3>
          <p className={result.success ? "text-green-700" : "text-red-700"}>
            {result.message}
          </p>
          {result.success && (
            <div className="mt-4 text-right">
              <Button 
                onClick={onNextChallenge}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 text-right">
          <Button 
            onClick={onSubmit}
            disabled={!password || isLoading}
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-md"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking</>
            ) : 'Submit Password'}
          </Button>
        </div>
      )}
    </>
  );
}
