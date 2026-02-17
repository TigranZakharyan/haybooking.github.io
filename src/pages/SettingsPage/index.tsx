import { useState } from "react";
import { SwitchTabs } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { Avatar } from "./ui/Avatar";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-text-body mb-1.5 tracking-tight">
              Account Information
            </h1>
            <p className="text-sm text-text-body/60 mb-10">
              View and manage your account details.
            </p>

            <SwitchTabs
              tabs={["profile", "security"]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Avatar */}
          <Avatar user={user} />
        </div>

        {/* Tab content */}
        {activeTab === "profile" ? (
          <ProfileTab
            user={user}
          />
        ) : (
          <SecurityTab />
        )}
      </div>
    </div>
  );
}