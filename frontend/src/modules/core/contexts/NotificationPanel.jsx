import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const togglePanel = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      await loadNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, readStatus: true } : n)));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.readStatus);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => axios.put(`/api/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  };

  return (
    <div className="relative">
      <button onClick={togglePanel} className="relative p-2 text-slate-200 hover:text-white transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
          <div className="py-2 px-3 bg-gray-50 flex items-center justify-between text-sm text-gray-700 border-b">
            <span className="font-semibold">Notifications</span>
            <button
              type="button"
              className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-4 border-b text-sm ${notif.readStatus ? 'bg-white text-gray-600' : 'bg-blue-50 text-gray-900 font-medium'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p>{notif.message}</p>
                      {notif.createdAt && (
                        <p className="text-[10px] mt-1 text-gray-400">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!notif.readStatus && (
                        <button
                          type="button"
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                          onClick={() => markAsRead(notif.id)}
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                        onClick={() => deleteNotification(notif.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
