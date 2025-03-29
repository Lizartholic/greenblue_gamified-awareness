import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Create initials from user's full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const handleSignOut = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="bx bx-shield-quarter text-primary-500 text-3xl mr-2"></i>
              <span className="font-bold text-xl font-[Poppins] text-gray-900">CyberSafe</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center">
              <div className="flex border border-gray-200 rounded-full py-1 px-3 items-center">
                <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  {getInitials(user.fullname)}
                </div>
                <span className="text-gray-700 font-medium mr-2">{user.fullname}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-500 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {}}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
