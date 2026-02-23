import { useState } from 'react';

interface ProfileMenuProps {
  initials: string;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export function ProfileAvatar({ initials, onSettingsClick, onLogoutClick }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsOpen(false);
    onSettingsClick?.();
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogoutClick?.();
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-gray-200 shadow-sm bg-primary text-white select-none hover:opacity-90 transition-opacity"
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-gray-200">
            <button 
              onClick={handleSettingsClick}
              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Settings
            </button>
            <button 
              onClick={handleLogoutClick}
              className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}