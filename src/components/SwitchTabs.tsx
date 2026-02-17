interface SwitchTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function SwitchTabs({ tabs, activeTab, onChange }: SwitchTabsProps) {
  const activeIndex = tabs.indexOf(activeTab);

  return (
    <div 
      className="relative flex w-64 items-center rounded-full bg-white/30 p-1"
      style={{ isolation: 'isolate' }} // Creates a new stacking context
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            relative z-10 flex-1 py-2 text-sm font-medium capitalize transition-colors duration-300
            ${tab === activeTab ? "text-primary" : "text-primary/60"}
          `}
        >
          {tab}
        </button>
      ))}

      {/* The Sliding Background */}
      <div
        className="absolute bottom-1 top-1 left-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out"
        style={{
          // We divide the total width (minus padding) by the number of tabs
          width: `calc((100% - 8px) / ${tabs.length})`,
          // Move it exactly one "tab width" per index
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
    </div>
  );
}