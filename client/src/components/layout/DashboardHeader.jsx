import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, Settings, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { notificationService } from '../../services/index';
import { formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';

const DashboardHeader = ({ onMenuToggle, title, dashboardBase }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationService.getAll({ limit: 6 });
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } catch { /* ignore */ }
    };
    if (user) fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={async () => { await notificationService.markAllRead(); setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }}
                    className="text-xs text-blue-700 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
                ) : notifications.map(n => (
                  <div key={n._id} onClick={() => handleMarkRead(n._id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />}
                      <div className={!n.isRead ? '' : 'ml-3.5'}>
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <Link to={`${dashboardBase}/notifications`} onClick={() => setShowNotifs(false)}
                  className="block text-center text-sm text-blue-700 hover:underline">View all</Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <Avatar user={user} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.firstName}</span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
              <Link to={`${dashboardBase}/profile`} onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={15} />Profile
              </Link>
              <Link to={`${dashboardBase}/settings`} onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={15} />Settings
              </Link>
              <hr className="my-1 border-gray-100" />
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <LogOut size={15} />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
