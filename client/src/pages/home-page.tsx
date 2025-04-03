import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import UserMenu from '@/components/layout/user-menu';
import ModuleCard from '@/components/game/module-card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import bgImage from '../assets/greenphoto.png';

// Game module definitions
const gameModules = [
  {
    id: 'phishing',
    title: 'Phishing Frenzy 🎣',
    description: 'Learn to identify phishing emails and suspicious messages before they hook you!',
    icon: 'fa-fish',
    iconColor: 'text-blue-500',
    bgGradient: 'from-blue-400/90 to-cyan-500/90',
    duration: '~15 min',
    path: '/modules/phishing',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'password',
    title: 'Password Challenge 🔐',
    description: 'Create strong, unique passwords and learn how to manage them securely.',
    icon: 'fa-lock',
    iconColor: 'text-teal-500',
    bgGradient: 'from-teal-400/90 to-green-500/90',
    duration: '~10 min',
    path: '/modules/password',
    coverImage: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'spotthescam',
    title: 'Spot the Scam 👁️',
    description: 'Train your eye to recognize fake websites, fraudulent messages and common scams.',
    icon: 'fa-eye',
    iconColor: 'text-amber-500',
    bgGradient: 'from-amber-400/90 to-orange-500/90',
    duration: '~12 min',
    path: '/modules/spotthescam',
    coverImage: 'https://images.unsplash.com/photo-1562577308-c8b2614b9b9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'masquerading',
    title: 'Masquerade Unmasked 🎭',
    description: 'Learn how to detect threats that disguise themselves as trusted entities.',
    icon: 'fa-mask',
    iconColor: 'text-purple-500',
    bgGradient: 'from-purple-400/90 to-indigo-600/90',
    duration: '~15 min',
    path: '/modules/masquerading',
    coverImage: 'https://images.unsplash.com/photo-1563237023-b1e970526dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80'
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user progress - if we had a proper backend
  const { data: progress } = useQuery({
    queryKey: ['/api/user/progress'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user/progress');
        return await res.json();
      } catch (error) {
        // Fallback for demo purposes
        return { 
          overallProgress: 25,
          modules: {
            phishing: { progress: 45, score: 450 },
            password: { progress: 60, score: 320 },
            spotthescam: { progress: 15, score: 150 },
            masquerading: { progress: 5, score: 50 }
          }
        };
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground">CyberSafe</h1>
            </div>
            
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section with Background Image */}
        <div className="rounded-xl overflow-hidden mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90"></div>
          <img 
            src={bgImage}
            alt="Cyber security background" 
            className="w-full h-64 object-cover object-center"
          />
          <div className="absolute inset-0 flex items-center px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-white font-heading mb-2">
                Welcome to CyberSafe{user ? `, ${user.fullname}` : ''}
              </h1>
              <p className="text-white/90 mb-4">
                Level up your cyber security skills through fun, interactive challenges that will help protect you online.
              </p>
              <div className="flex items-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="font-medium">Your Progress:</span>
                  <div className="w-48 h-2 bg-white/30 rounded-full mt-1">
                    <div 
                      className="h-2 bg-white rounded-full" 
                      style={{ width: `${progress?.overallProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Modules */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Game Modules</h2>
          <p className="text-gray-600 mb-6">Select a challenge to test and improve your cyber hygiene skills.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModules.map(module => (
              <ModuleCard 
                key={module.id}
                module={module}
                progress={progress?.modules?.[module.id]?.progress || 0}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
