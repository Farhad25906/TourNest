"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/auth/auth";
import { CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps {
  userId?: string;
  token?: string;
  redirect?: string;
}

const ResetPasswordForm = ({ userId, token, redirect = "/login" }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPassword, null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect on success
  if (state?.success && state.redirectToLogin) {
    setTimeout(() => {
      router.push(redirect);
    }, 2000);
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{state.message}</p>
              <p className="text-sm">
                You will be redirected to login page shortly...
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {state?.success === false && !state.errors && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <p>{state.message}</p>
              <p className="text-sm">
                The reset link may have expired. Please request a new one.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden fields for email reset */}
      {userId && token && (
        <>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="isEmailReset" value="true" />
        </>
      )}

      {/* New Password */}
      <Field>
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            defaultValue={state?.formData?.newPassword || ""}
            required
            disabled={isPending || state?.success}
            className="pl-10 pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            disabled={isPending || state?.success}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "newPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "newPassword")?.message}
          </p>
        )}
      </Field>

      {/* Confirm Password */}
      <Field>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            defaultValue={state?.formData?.confirmPassword || ""}
            required
            disabled={isPending || state?.success}
            className="pl-10 pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            disabled={isPending || state?.success}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "confirmPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "confirmPassword")?.message}
          </p>
        )}
      </Field>

      <Button 
        type="submit" 
        disabled={isPending || state?.success} 
        className="w-full"
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;