import { useState, useEffect } from "react";
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
import { Shield, Copy, Check, Download, AlertTriangle, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const verifySchema = z.object({
  token: z.string().min(6, "Please enter a 6-digit code").max(6, "Code must be 6 digits"),
});

type VerifyForm = z.infer<typeof verifySchema>;

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function TwoFactorSetup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: setup, 2: verify, 3: backup codes
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: "",
    },
  });

  useEffect(() => {
    // Generate 2FA setup data
    generateSetup();
  }, []);

  const generateSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/two-factor/setup', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate 2FA setup');
      }

      const data = await response.json();
      setSetupData(data);
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VerifyForm) => {
    if (!setupData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/two-factor/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: data.token,
          secret: setupData.secret,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      toast({
        title: "Verification Successful",
        description: "2FA has been enabled for your account.",
      });

      setStep(3); // Show backup codes
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (!setupData) return;
    
    const codesText = setupData.backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    
    toast({
      title: "Backup Codes Copied",
      description: "Your backup codes have been copied to clipboard.",
    });

    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;

    const codesText = setupData.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotekit-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Codes Downloaded",
      description: "Your backup codes have been saved to your downloads.",
    });
  };

  const finishSetup = () => {
    setLocation('/dashboard');
  };

  if (isLoading && !setupData) {
    return (
      <div className="min-h-screen bg-[#060517] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    );
  }

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
                {step === 1 && "Set Up Two-Factor Authentication"}
                {step === 2 && "Verify Your Setup"}
                {step === 3 && "Save Your Backup Codes"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {step === 1 && "Secure your account with an extra layer of protection"}
                {step === 2 && "Enter the 6-digit code from your authenticator app"}
                {step === 3 && "Keep these codes safe for account recovery"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && setupData && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Step 1: Scan QR Code
                    </h3>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img 
                        src={setupData.qrCodeUrl} 
                        alt="2FA QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Recommended Apps:</span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>• Google Authenticator</div>
                      <div>• Microsoft Authenticator</div>
                      <div>• Authy</div>
                      <div>• 1Password</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Manual Entry Key:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-800 text-green-400 p-2 rounded text-sm font-mono">
                        {setupData.secret}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(setupData.secret);
                          toast({ title: "Key copied to clipboard" });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full bg-green-400 hover:bg-green-500 text-white"
                  >
                    Continue to Verification
                  </Button>
                </div>
              )}

              {step === 2 && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Step 2: Enter Verification Code
                      </h3>
                      <p className="text-sm text-gray-400">
                        Open your authenticator app and enter the 6-digit code
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="000000"
                              className="text-center text-2xl tracking-widest bg-gray-800 border-gray-700 text-white"
                              maxLength={6}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || form.watch("token").length !== 6}
                        className="flex-1 bg-green-400 hover:bg-green-500 text-white"
                      >
                        {isLoading ? "Verifying..." : "Verify Code"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {step === 3 && setupData && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Step 3: Save Your Backup Codes
                    </h3>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Important:</span>
                      </div>
                      <p className="text-yellow-300 text-sm mt-1">
                        Store these codes safely. Each can only be used once to access your account if you lose your authenticator.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="justify-center py-2 bg-gray-700 text-gray-300 font-mono"
                        >
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={copyBackupCodes}
                      className="flex-1"
                    >
                      {copiedCodes ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Codes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadBackupCodes}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <Separator className="bg-gray-700" />

                  <Button
                    onClick={finishSetup}
                    className="w-full bg-green-400 hover:bg-green-500 text-white"
                  >
                    Complete Setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Skip for now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}