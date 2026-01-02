import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  MdRefresh,
} from 'react-icons/md';
import { RiMenuFold3Line, RiMenuUnfold3Line } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../general/redux/store';

interface NavbarProps {
  className?: string;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar = ({ className = '', toggleSidebar, sidebarOpen }: NavbarProps) => {

  const { user, branchData } = useSelector((state: RootState) => state.user);

  const isAdmin = user?.role === "admin";

  const [currentTime] = useState(() => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      date: now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    };
  });

  function getGreetingMessage() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";

    return "Good Night";
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={` bg-white shadow-lg shadow-primary/10 ${className}`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Side - Application Tabs */}
        <div className='flex items-center gap-4'>
          <button
            onClick={toggleSidebar}
            className={`${sidebarOpen && 'hidden'} text-gray-600 hover:text-gray-900 cursor-pointer bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors p-2`}
          >
            {sidebarOpen ? <RiMenuFold3Line size={20} /> : <RiMenuUnfold3Line size={20} />}
          </button>

          {/* <BackButton /> */}


          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col px-1 text-secondary"
          >
            <span className='text-xs'>Hello {isAdmin ? "Admin" : branchData?.branch},</span>
            <span className='text-base font-bold'>{getGreetingMessage()}</span>
          </motion.div>
        </div>

        {/* Right Side - Actions and Info */}
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.reload()}
            className="p-2 text-primary cursor-pointer hover:bg-primary/10 rounded-lg transition-colors"
          >
            <MdRefresh size={20} />
          </motion.button>

          {/* Time and Date */}
          <div className="text-center bg-primary rounded-full px-5 py-1">
            <div className="text-sm font-medium text-white">
              {currentTime.time}
            </div>
            <div className="text-[10px] text-white">
              {currentTime.date}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
