import { useState } from "react";
import { SectionTitle, SwitchTabs } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { BusinessTab } from "./BusinessTab";
import { Avatar } from "./ui/Avatar";
import { useTranslation } from "react-i18next";

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const tabs = [
    {
      label: t("settings.business"),
      value: "business",
    },
    {
      label: t("settings.profile"),
      value: "profile",
    },
    {
      label: t("settings.security"),
      value: "security",
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].value);

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex flex-col">
            <SectionTitle
              title={t("settings.title")}
              subtitle={t("settings.subtitle")}
            />
            <div className="lg:hidden mb-4">
              <Avatar user={user} />
            </div>
            <SwitchTabs
              tabs={tabs.map((e) => e.label)}
              activeTab={tabs.find(e => e.value === activeTab)?.label as string}
              onChange={(e: string) =>
                setActiveTab(tabs.find(({ label }) => label === e)?.value as string)
              }
            />
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <Avatar user={user} />
          </div>
        </div>

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
