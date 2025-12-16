import { Metadata } from "next";
import ChangePasswordForm from "@/components/module/Auth/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Change Password | Tour Booking",
  description: "Change your account password",
};

export default function ChangePasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Change Password</CardTitle>
            <CardDescription className="text-center">
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Should contain letters and numbers</li>
                <li>• Should not be the same as old password</li>
                <li>• Use a unique password for this account</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}