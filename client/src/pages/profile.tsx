import { useState, useEffect } from "react";
import { QuoteKitHeader } from "@/components/calculator-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/supabase";
import { useLocation } from "wouter";
import { User, Mail, Key, CreditCard, Shield } from "lucide-react";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLocation('/login');
          return;
        }
        setCurrentUser(user);
        setFormData({
          fullName: user.full_name || "",
          email: user.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (error) {
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [setLocation]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neon-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900">
      <QuoteKitHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="bg-midnight-900 border-midnight-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-midnight-900 border-midnight-600 text-white"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-neon-500 hover:bg-neon-600">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="bg-midnight-900 border-midnight-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="bg-midnight-900 border-midnight-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="bg-midnight-900 border-midnight-600 text-white"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-neon-500 hover:bg-neon-600">
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Overview */}
          <div className="space-y-6">
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-sm">Email</Label>
                  <p className="text-white">{currentUser?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Plan</Label>
                  <p className="text-white">Free</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Member Since</Label>
                  <p className="text-white">
                    {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Separator className="bg-midnight-600" />
                <Button 
                  variant="outline" 
                  className="w-full border-midnight-600 text-gray-300"
                  onClick={() => window.open('/pricing', '_blank')}
                >
                  View Billing
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-xs">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-midnight-600 text-gray-300">
                    Enable
                  </Button>
                </div>
                <Separator className="bg-midnight-600" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Login Activity</p>
                    <p className="text-gray-400 text-xs">View recent login sessions</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-midnight-600 text-gray-300">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-midnight-800 border-midnight-700 border-red-500">
              <CardHeader>
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}