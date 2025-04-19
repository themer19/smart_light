import React from 'react';
import { FiSearch, FiBell, FiUser, FiMenu } from 'react-icons/fi'; // Ajout de FiMenu ici

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm fixed top-0 right-0 left-0 h-16 flex items-center 
      justify-between px-6 z-10" style={{ left: 'var(--sidebar-width)' }}>
      
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-4 p-2 rounded-lg hover:bg-gray-100">
          <FiMenu size={20} />
        </button>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <FiUser size={16} />
          </div>
          <span className="font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;