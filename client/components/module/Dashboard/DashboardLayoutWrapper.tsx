import CommonDashboardLayout from "@/app/(dashboardLayout)/layout";
import { UserRole } from "@/lib/auth-utils";


interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  userRole: UserRole;
}

const DashboardLayoutWrapper = ({
  children,
  requiredRole,
  userRole,
}: DashboardLayoutWrapperProps) => {
  // Check if user has required role
  if (userRole !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You dont have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <CommonDashboardLayout>{children}</CommonDashboardLayout>;
};

export default DashboardLayoutWrapper;