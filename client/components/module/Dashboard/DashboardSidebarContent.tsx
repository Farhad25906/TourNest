"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/user.interface";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/assets/logo/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const pathname = usePathname();
  
  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-blue-100 bg-gradient-to-b from-white to-blue-50/30">
      {/* Logo/Brand */}
      <div className="flex h-20 items-center justify-center border-b border-blue-100 px-6 bg-white">
        <Link href={dashboardHome} className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <Image
              src={logo}
              width={130}
              height={130}
              alt="TourNest Logo"
              className="relative z-10 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-6">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h4 className="mb-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent animate-pulse" />
                      )}
                      <Icon className={cn(
                        "h-5 w-5 relative z-10 transition-transform duration-200",
                        isActive ? "scale-110" : "group-hover:scale-110"
                      )} />
                      <span className="flex-1 relative z-10">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "default"}
                          className={cn(
                            "ml-auto relative z-10",
                            isActive 
                              ? "bg-white/20 text-white border-white/30" 
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
              {sectionIdx < navItems.length - 1 && (
                <Separator className="my-4 bg-blue-100" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info at Bottom */}
      <div className="border-t border-blue-100 p-4 bg-white">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-all duration-200 cursor-pointer group">
          <Avatar className="h-10 w-10 ring-2 ring-blue-200 ring-offset-2 transition-transform duration-200 group-hover:scale-105">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
              {userInfo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-gray-900">{userInfo.name}</p>
            <p className="text-xs text-gray-600 capitalize font-medium">
              {userInfo.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebarContent;