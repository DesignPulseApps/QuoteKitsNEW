import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/ChatGPT Image Jun 11, 2025, 11_57_41 AM_1749655121133.png";

export function QuoteKitHeader() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      window.location.href = '/';
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src={logoImage} 
                  alt="QuoteKits Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-white text-lg font-semibold">QuoteKits</span>
              </div>
            </Link>
          </div>

          {/* Right Side - Navigation */}
          <div className="flex items-center space-x-6">
            {currentUser ? (
              // Logged in navigation
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/upgrade">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Upgrade
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Profile
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="border-midnight-600 text-gray-300 hover:text-white"
                >
                  Log Out
                </Button>
              </>
            ) : (
              // Guest navigation
              <a 
                href="https://quotekits.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                Powered by QuoteKits.com
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}