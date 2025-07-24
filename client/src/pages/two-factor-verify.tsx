import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import Header from "@/components/landing/header";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle } from "lucide-react";

const verifySchema = z.object({
  token: z.string().min(6, "Please enter a valid code"),
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function TwoFactorVerify() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/two-factor/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: data.token,
          isBackupCode: useBackupCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const result = await response.json();
      
      if (result.usedBackupCode) {
        toast({
          title: "Backup Code Used",
          description: `You have ${result.remainingBackupCodes} backup codes remaining.`,
          variant: "default",
        });
      }

      toast({
        title: "Login Successful",
        description: "You've been successfully logged in.",
      });

      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: useBackupCode 
          ? "Invalid backup code. Please try again." 
          : "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060517]">
      <Header />
      
      <div className="container max-w-md mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-400">
                {useBackupCode 
                  ? "Enter one of your backup codes"
                  : "Enter the 6-digit code from your authenticator app"
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          {useBackupCode ? "Backup Code" : "Verification Code"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                            className="text-center text-2xl tracking-widest bg-gray-800 border-gray-700 text-white"
                            maxLength={useBackupCode ? 9 : 6}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (!useBackupCode) {
                                value = value.replace(/\D/g, '');
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || form.watch("token").length < (useBackupCode ? 8 : 6)}
                    className="w-full bg-green-400 hover:bg-green-500 text-white"
                  >
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">Having trouble?</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    form.reset();
                  }}
                  className="w-full text-gray-400 hover:text-white"
                >
                  {useBackupCode 
                    ? "Use authenticator app instead"
                    : "Use backup code instead"
                  }
                </Button>

                {useBackupCode && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Note:</span>
                    </div>
                    <p className="text-yellow-300 text-sm mt-1">
                      Each backup code can only be used once. Consider setting up a new authenticator after logging in.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center mt-6">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}