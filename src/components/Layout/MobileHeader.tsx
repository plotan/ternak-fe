import React from 'react';
import { Menu, Sheet as Sheep } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { userProfile } = useAuth();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-2">
          <Sheep className="h-6 w-6 text-green-600" />
          <h1 className="text-lg font-semibold text-gray-800">Sistem Ternak</h1>
        </div>
        
        <div className="text-sm text-gray-600">
          {userProfile?.username}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;