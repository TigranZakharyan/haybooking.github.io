interface SwitchTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function SwitchTabs({ tabs, activeTab, onChange }: SwitchTabsProps) {
  const activeIndex = tabs.indexOf(activeTab);

  return (
    <div
      className="relative flex items-center rounded-full border border-gray-200 bg-gray-100 p-1 shadow-sm"
      style={{ isolation: "isolate" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            relative z-10 flex-1 py-2 text-sm font-medium capitalize transition-all duration-300
            ${
              tab === activeTab
                ? "text-primary !font-bold"
                : "text-gray-600 hover:text-primary"
            }
          `}
        >
          {tab}
        </button>
      ))}

      {/* Sliding Background */}
      <div
        className="absolute bottom-1 top-1 left-1 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${tabs.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
    </div>
  );
}