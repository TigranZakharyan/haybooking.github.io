import { useState } from "react";
import { SectionTitle, SwitchTabs } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { BusinessTab } from "./BusinessTab";
import { Avatar } from "./ui/Avatar";

const tabs = ["business", "profile", "security"];

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0]);

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">

          {/* Left: title + subtitle + avatar (below lg) + tabs */}
          <div className="flex flex-col">
            <SectionTitle 
              title="Account Information"
              subtitle="View and manage your account details."
            />

            {/* Avatar — sits between subtitle and tabs on mobile/md */}
            <div className="lg:hidden mb-4">
              <Avatar user={user} />
            </div>

            <SwitchTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Avatar — large screens only, floated right */}
          <div className="hidden lg:block flex-shrink-0">
            <Avatar user={user} />
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "profile" ? (
          <ProfileTab />
        ) : activeTab === "business" ? (
          <BusinessTab />
        ) : (
          <SecurityTab />
        )}
      </div>
    </div>
  );
}