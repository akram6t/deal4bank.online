
"use client"

import { useState, useEffect, Suspense } from 'react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setVerifying(false);
        setIsValid(false);
        return;
      }
      
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
      } finally {
        setVerifying(false);
      }
    }
    verifyCode();
  }, [oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: "Error", description: "Passwords do not match." });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: "Error", description: "Password should be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
        setSuccess(true);
        toast({ title: "Success", description: "Password has been reset successfully." });
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Reset Failed", 
        description: error.message || "Failed to reset password." 
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying reset code...</p>
      </div>
    );
  }

  if (!isValid && !success) {
    return (
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-destructive">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-headline">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/login')} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-headline">Password Reset</CardTitle>
          <CardDescription>
            Your password has been changed successfully. You will be redirected to the login page shortly.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/login')} className="w-full bg-green-600 hover:bg-green-700">
            Sign In Now
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2 text-primary">
          <KeyRound className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-headline">New Password</CardTitle>
        <CardDescription>Set a strong password for your admin account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleReset}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Changing Password..." : "Reset Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
