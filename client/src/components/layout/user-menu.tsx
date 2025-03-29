import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';

export default function UserMenu() {
  const { user, logoutMutation } = useAuth();
  
  // Get user initials
  const userInitials = user?.fullname 
    ? user.fullname.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.username?.substring(0, 2).toUpperCase() || 'U';
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
          <div className="w-8 h-8 rounded-full bg-secondary-light flex items-center justify-center text-secondary">
            <span className="font-medium">{userInitials}</span>
          </div>
          <span>{user?.username}</span>
          <i className="fas fa-chevron-down text-xs text-gray-500"></i>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
          className="text-red-600 focus:text-red-600"
        >
          {logoutMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Out</>
          ) : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
