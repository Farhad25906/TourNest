/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { cookies } from "next/headers";

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
  userId?: string;
  token?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Array<{ field: string; message: string }>;
  formData?: any;
  redirectToLogin?: boolean;
}

// ==================== CHANGE PASSWORD ====================

export const changePassword = async (
  prevState: AuthResponse | null,
  formData: FormData
): Promise<AuthResponse> => {
  try {
    const data: ChangePasswordFormData = {
      oldPassword: formData.get("oldPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Frontend validation
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.oldPassword) {
      errors.push({ field: "oldPassword", message: "Current password is required" });
    }

    if (!data.newPassword) {
      errors.push({ field: "newPassword", message: "New password is required" });
    } else if (data.newPassword.length < 6) {
      errors.push({ field: "newPassword", message: "Password must be at least 6 characters" });
    }

    if (!data.confirmPassword) {
      errors.push({ field: "confirmPassword", message: "Confirm password is required" });
    }

    if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
      errors.push({ field: "confirmPassword", message: "Passwords do not match" });
    }

    if (data.oldPassword && data.newPassword && data.oldPassword === data.newPassword) {
      errors.push({ field: "newPassword", message: "New password must be different from current password" });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        formData: data,
        message: "Please fix the errors below",
      };
    }

    // Call API
    const res = await serverFetch.post("/auth/change-password", {
      body: JSON.stringify({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.success) {
      return {
        success: true,
        message: result.message || "Password changed successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to change password",
      formData: data,
      errors: [{ field: "oldPassword", message: result.message || "Invalid credentials" }],
    };
  } catch (error: any) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: error.message || "Failed to change password. Please try again.",
    };
  }
};

// ==================== FORGOT PASSWORD ====================

export const forgotPassword = async (
  prevState: AuthResponse | null,
  formData: FormData
): Promise<AuthResponse> => {
  try {
    const email = formData.get("email") as string;

    // Frontend validation
    const errors: Array<{ field: string; message: string }> = [];

    if (!email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        formData: { email },
        message: "Please fix the errors below",
      };
    }

    // Call API
    const res = await serverFetch.post("/auth/forgot-password", {
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.success) {
      return {
        success: true,
        message: result.message || "Password reset link has been sent to your email!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to send reset link",
      formData: { email },
    };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "Failed to send reset link. Please try again.",
    };
  }
};

// ==================== RESET PASSWORD ====================

export const resetPassword = async (
  prevState: AuthResponse | null,
  formData: FormData
): Promise<AuthResponse> => {
  try {
    const userId = formData.get("userId") as string;
    const token = formData.get("token") as string;
    const isEmailReset = formData.get("isEmailReset") === "true";
    
    const data: ResetPasswordFormData = {
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      userId,
      token,
    };

    // Frontend validation
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.newPassword) {
      errors.push({ field: "newPassword", message: "New password is required" });
    } else if (data.newPassword.length < 6) {
      errors.push({ field: "newPassword", message: "Password must be at least 6 characters" });
    }

    if (!data.confirmPassword) {
      errors.push({ field: "confirmPassword", message: "Confirm password is required" });
    }

    if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
      errors.push({ field: "confirmPassword", message: "Passwords do not match" });
    }

    if (isEmailReset && (!userId || !token)) {
      errors.push({ field: "newPassword", message: "Invalid reset link" });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        formData: data,
        message: "Please fix the errors below",
      };
    }

    const url = "/auth/reset-password";
    const body: any = {
      password: data.newPassword,
    };

    if (isEmailReset) {
      // Reset via email link
      body.id = userId;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };
      
      const res = await serverFetch.post(url, { body: JSON.stringify(body), headers });
      const result = await res.json();

      if (result.success) {
        return {
          success: true,
          message: result.message || "Password reset successfully!",
          data: result.data,
          redirectToLogin: true,
        };
      }

      return {
        success: false,
        message: result.message || "Failed to reset password",
        formData: data,
      };
    } else {
      // Reset while logged in (change password flow)
      const res = await serverFetch.post(url, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (result.success) {
        return {
          success: true,
          message: result.message || "Password reset successfully!",
          data: result.data,
          redirectToLogin: true,
        };
      }

      return {
        success: false,
        message: result.message || "Failed to reset password",
        formData: data,
      };
    }
  } catch (error: any) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: error.message || "Failed to reset password. Please try again.",
    };
  }
};

// ==================== LOGIN ====================

export const login = async (
  prevState: AuthResponse | null,
  formData: FormData
): Promise<AuthResponse> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirect") as string;

    // Frontend validation
    const errors: Array<{ field: string; message: string }> = [];

    if (!email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }

    if (!password) {
      errors.push({ field: "password", message: "Password is required" });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        formData: { email, password },
        message: "Please fix the errors below",
      };
    }

    // Call API
    const res = await serverFetch.post("/auth/login", {
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.success) {
      // Get cookies from response
      const cookiesHeader = res.headers.get("set-cookie");
      
      return {
        success: true,
        message: result.message || "Login successful!",
        data: {
          ...result.data,
          redirectTo: redirectTo || "/dashboard",
          needPasswordChange: result.data?.needPasswordChange,
        },
      };
    }

    return {
      success: false,
      message: result.message || "Invalid email or password",
      formData: { email },
      errors: [{ field: "password", message: result.message || "Invalid credentials" }],
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message || "Failed to login. Please try again.",
    };
  }
};

// ==================== LOGOUT ====================

export const logout = async (): Promise<AuthResponse> => {
  try {
    const cookieStore = await cookies();
    
    // Clear cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    
    return {
      success: true,
      message: "Logged out successfully!",
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "Failed to logout. Please try again.",
    };
  }
};

// ==================== GET CURRENT USER ====================

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const res = await serverFetch.get("/auth/me");
    const result = await res.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to get user data",
    };
  } catch (error: any) {
    console.error("Get current user error:", error);
    return {
      success: false,
      message: "Failed to get user data. Please login again.",
    };
  }
};

// ==================== REFRESH TOKEN ====================

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const res = await serverFetch.post("/auth/refresh-token");
    const result = await res.json();

    if (result.success) {
      return {
        success: true,
        message: "Token refreshed successfully",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to refresh token",
    };
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      message: "Session expired. Please login again.",
    };
  }
};