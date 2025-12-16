
import DashboardLayoutWrapper from "@/components/module/Dashboard/DashboardLayoutWrapper";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";

const AdminDashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const userInfo = (await getUserInfo()) as UserInfo;
  
  return (
    <DashboardLayoutWrapper 
      requiredRole="ADMIN" 
      userRole={userInfo.role}
    >
      {children}
    </DashboardLayoutWrapper>
  );
};

export default AdminDashboardLayout;