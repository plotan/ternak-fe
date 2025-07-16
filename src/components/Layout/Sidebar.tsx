import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Building, Syringe, Heart, History, Settings, LogOut, Sheet as Sheep } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { userProfile, logout } = useAuth();

  const navigationItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/kambing', icon: Sheep, label: 'Kambing' },
    { to: '/kandang', icon: Building, label: 'Kandang' },
    { to: '/vaksin', icon: Syringe, label: 'Vaksin' },
    { to: '/vaksinisasi', icon: Heart, label: 'Vaksinisasi' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Sistem Ternak</h1>
          <p className="text-sm text-gray-600">{userProfile?.username} ({userProfile?.role})</p>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 ${
                  isActive ? 'bg-green-100 text-green-600 border-r-2 border-green-600' : ''
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;