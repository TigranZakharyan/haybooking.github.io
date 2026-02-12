import type { TTabOption } from "@/types";

interface TabsProps<T extends string> {
  tabs: TTabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ 
  tabs, 
  activeTab, 
  onChange, 
  className = "" 
}: TabsProps<T>) {
  return (
    <div className={`flex w-full border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button" 
            className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 relative
              ${isActive ? "text-liberty" : "text-gray-400 hover:text-gray-600"}
            `}
          >
            {tab.label}
            {/* Animated Active Indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-liberty" />
            )}
          </button>
        );
      })}
    </div>
  );
}