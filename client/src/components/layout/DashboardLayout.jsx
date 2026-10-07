import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = ({ navItems, title, sidebarTitle, dashboardBase }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title from current route
  const getCurrentTitle = () => {
    const path = location.pathname;
    const found = navItems.find(item => item.to === path);
    return found?.label || title;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        title={sidebarTitle}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getCurrentTitle()}
          dashboardBase={dashboardBase}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
