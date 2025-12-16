import { Metadata } from "next";
import ForgotPasswordForm from "@/components/module/Auth/ForgotPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password | Tour Booking",
  description: "Reset your account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You will receive an email with a reset link</li>
                <li>• The link expires in 5 minutes</li>
                <li>• Click the link to set a new password</li>
                <li>• You will be redirected to login after reset</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}