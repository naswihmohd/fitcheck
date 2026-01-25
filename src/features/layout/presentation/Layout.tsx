import { useState } from 'react';
import { Outlet } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../navbar/presentation/Navbar';
import Sidebar from './components/Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto">
        <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Navigation */}
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} className="lg:ml-0" />

        {/* Page Content */}
        <main className="flex-1 bg-[#F6F6F6] overflow-auto scrollbar-none smooth-scroll pt-0">
          <div className="h-full w-full md:p-4 p-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
