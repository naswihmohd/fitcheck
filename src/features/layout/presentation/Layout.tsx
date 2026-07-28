import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen pb-24 lg:pb-0 bg-gray-50">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden lg:block lg:static">
        <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 bg-[#F6F6F6] overflow-auto scrollbar-none smooth-scroll pt-0 pb-24 lg:pb-0">
          <div className="h-full w-full md:p-4 p-3">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
