
import { useLocation } from 'wouter';

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90 text-white p-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Welcome to CyberSafe</h1>
        <p className="text-xl md:text-2xl mb-8">
          Ready to boost your cyber security skills? Become a cyber champion
        </p>
        <div className="space-y-4">
          <button
            onClick={() => setLocation('/auth')}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Start Game
          </button>
          <button
            onClick={() => setLocation('/dashboard')}
            className="block w-full bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
