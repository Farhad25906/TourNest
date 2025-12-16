"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Bell, Plane, MessageSquare, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  type: "booking" | "message" | "tour" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Tour-related notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "booking",
    title: "New Booking Confirmed",
    message: "John Doe has booked your Bali Adventure Tour for next month",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "2",
    type: "tour",
    title: "Tour Starting Soon",
    message: "Your Tokyo Food Tour starts in 3 days. 8 travelers confirmed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New Message from Traveler",
    message: "Sarah Johnson asked about accommodation options on your tour",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
  },
  {
    id: "4",
    type: "booking",
    title: "Booking Payment Received",
    message: "Payment of $499 received for Greece Island Hopping Tour",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Tour Review Posted",
    message: "Mike Chen left a 5-star review for your Peru Expedition",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "booking":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "tour":
      return <Plane className="h-4 w-4 text-blue-600" />;
    case "message":
      return <MessageSquare className="h-4 w-4 text-purple-600" />;
    case "system":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationBg = (type: Notification["type"]) => {
  switch (type) {
    case "booking":
      return "bg-green-50";
    case "tour":
      return "bg-blue-50";
    case "message":
      return "bg-purple-50";
    case "system":
      return "bg-amber-50";
    default:
      return "bg-gray-50";
  }
};

export default function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Bell className="h-5 w-5 text-blue-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-[10px] font-bold text-white flex items-center justify-center shadow-lg ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-xl border-blue-100">
        <DropdownMenuLabel className="flex items-center justify-between py-3 bg-gradient-to-r from-blue-50 to-blue-100/50">
          <span className="text-base font-semibold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-100" />
        <ScrollArea className="h-[400px]">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            MOCK_NOTIFICATIONS.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg ${getNotificationBg(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-none text-gray-900">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1 shadow-lg shadow-blue-300" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator className="bg-blue-100" />
        <DropdownMenuItem className="text-center justify-center py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer hover:bg-blue-50">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}