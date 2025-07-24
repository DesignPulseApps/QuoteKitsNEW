import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setLocation('/login');
        return;
      }

      try {
        await apiRequest('/api/auth/me');
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setLocation('/login');
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return <>{children}</>;
}