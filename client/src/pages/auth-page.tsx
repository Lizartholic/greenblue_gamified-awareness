import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import bgImage from '../assets/greenphoto.png';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Cyber security background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
      </div>
      
      {/* Login/Register card */}
      <div className="z-10 flex w-full max-w-6xl">
        {/* Left side: Form */}
        <Card className="bg-white rounded-xl shadow-xl overflow-hidden w-full md:w-1/2 p-1">
          <CardContent className="bg-background p-6">
            {isLogin ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-foreground">CyberSafe</h1>
                  </div>
                  <p className="text-sm text-gray-600">Learn cyber hygiene through fun challenges</p>
                </div>
                
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
              </>
            ) : (
              <>
                <div className="flex items-center mb-6">
                  <button 
                    className="text-gray-600 hover:text-gray-900 mr-2"
                    onClick={() => setIsLogin(true)}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h2 className="text-xl font-bold font-heading text-foreground">Create Your Account</h2>
                </div>
                
                <RegisterForm />
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Right side: Hero section (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-transparent text-white p-10 flex-col justify-center">
          <h2 className="text-4xl font-bold mb-6">Stay Safe Online</h2>
          <p className="text-white/90 text-lg mb-4">
            Learn essential cyber hygiene skills through interactive challenges
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Learn to identify phishing attempts
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Create strong, secure passwords
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Protect your personal information
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
