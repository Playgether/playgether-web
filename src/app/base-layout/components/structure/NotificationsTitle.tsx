import { Bell } from "lucide-react";
import React from "react";

export default function NotificationsTitle() {
  return (
    <>
      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
        <Bell className="w-4 h-4 text-white" />
      </div>
      <span>Notificações</span>
    </>
  );
}
