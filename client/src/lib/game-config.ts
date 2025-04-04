
export const gameModules = [
  {
    id: 'phishing',
    title: 'Phishing Frenzy 🎣',
    description: 'Learn to identify phishing emails and suspicious messages before they hook you!',
    icon: 'fa-fish',
    iconColor: 'text-blue-500',
    bgGradient: 'from-blue-400/90 to-cyan-500/90',
    duration: '~15 min',
    path: '/modules/phishing',
    difficulty: 'Beginner',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    scenarios: [
      {
        id: 1,
        title: 'Bank Email Scam',
        description: 'Identify a fake bank notification email'
      },
      {
        id: 2,
        title: 'Package Delivery Scam',
        description: 'Spot a fraudulent delivery notification'
      }
    ]
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
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    scenarios: [
      {
        id: 1,
        title: 'Password Strength',
        description: 'Create and test strong passwords'
      },
      {
        id: 2,
        title: 'Password Manager',
        description: 'Learn to use password managers effectively'
      }
    ]
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
    difficulty: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1562577308-c8b2614b9b9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    scenarios: [
      {
        id: 1,
        title: 'Social Engineering',
        description: 'Identify social engineering tactics'
      },
      {
        id: 2,
        title: 'Fake Websites',
        description: 'Learn to spot fraudulent websites'
      }
    ]
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
