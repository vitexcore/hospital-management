import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

const DashboardSidebar = ({ isOpen, onClose, navItems, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-950 to-blue-900 text-white z-50 flex flex-col sidebar-transition
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-400/30 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">M</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none">Medicare</span>
              <span className="block text-blue-300 text-xs font-medium leading-none">{title || 'Portal'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-blue-800 rounded-lg lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            item.section ? (
              <div key={item.section} className="pt-3 pb-1">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider px-3">{item.section}</p>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${isActive ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/8 hover:text-white'}`
                }
              >
                {item.icon && <item.icon size={17} className="flex-shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{item.badge}</span>
                ) : null}
              </NavLink>
            )
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-blue-800">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
