import { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/module/Auth/ResetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    userId?: string;
    token?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Reset Password | Tour Booking",
  description: "Reset your account password",
};

async function ResetPasswordContent({ searchParams }: { searchParams: Promise<{ userId?: string; token?: string }> }) {
  const { userId, token } = await searchParams;

  // Validate required params for email reset
  if (!userId || !token) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Key className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm 
          userId={userId}
          token={token}
          redirect="/login"
        />
        
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• At least 6 characters long</li>
            <li>• Should contain letters and numbers</li>
            <li>• Use a strong, unique password</li>
            <li>• Confirm your password exactly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function ResetPasswordSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <Skeleton className="h-10 w-10 mx-auto rounded-full" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  );
}