import { useRef, useEffect, useState } from "react";

interface SwitchTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function SwitchTabs({ tabs, activeTab, onChange }: SwitchTabsProps) {
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateSlider = () => {
    const container = containerRef.current;
    const activeButton = tabRefs.current.get(activeTab);
    
    if (container && activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  };

  useEffect(() => {
    updateSlider();
    
    // Update on window resize
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [activeTab, tabs]);

  // Update when any tab button size changes (e.g., font loading)
  useEffect(() => {
    const observer = new ResizeObserver(() => updateSlider());
    
    tabRefs.current.forEach((button) => {
      observer.observe(button);
    });
    
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex rounded-full border border-gray-200 bg-gray-100 p-1 shadow-sm"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          ref={(el) => {
            if (el) tabRefs.current.set(tab, el);
            else tabRefs.current.delete(tab);
          }}
          onClick={() => onChange(tab)}
          className={`
            relative z-10 whitespace-nowrap px-5 py-2 text-sm font-medium capitalize transition-colors duration-200
            ${
              tab === activeTab
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }
          `}
        >
          {tab}
        </button>
      ))}

      {/* Sliding Background */}
      <div
        className="absolute bottom-1 top-1 rounded-full bg-white shadow-md transition-all duration-200 ease-out"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
        }}
      />
    </div>
  );
}