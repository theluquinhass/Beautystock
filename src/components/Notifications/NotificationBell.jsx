import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function NotificationBell({ align = 'right' }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Optional: Realtime subscription for incoming notifications
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    handleNewNotification(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);

            // Check if there's an unread plan_expiring notification to show a toast
            const unreadExpiring = data?.find(n => n.type === 'plan_expiring' && !n.is_read);
            if (unreadExpiring && !sessionStorage.getItem('expiring_toast_shown')) {
                showExpiringToast(unreadExpiring);
                sessionStorage.setItem('expiring_toast_shown', 'true');
            }

        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        if (notification.type === 'plan_expiring') {
            showExpiringToast(notification);
        }
    };

    const showExpiringToast = (notification) => {
        toast((t) => (
            <div className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Atenção ao seu Plano PRO</p>
                        <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            navigate(notification.cta_url || '/conta');
                        }}
                        className="bg-black text-white text-xs font-bold py-2 px-4 rounded-lg flex-1 hover:bg-gray-800 transition-colors"
                    >
                        {notification.cta_label || 'Renovar Agora'}
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 text-gray-600 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Lembrar depois
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            position: 'top-center',
            style: {
                border: '1px solid #ffe4e6',
                padding: '16px',
                color: '#1f2937',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.1), 0 8px 10px -6px rgba(225, 29, 72, 0.1)',
                maxWidth: '400px'
            },
        });
    };

    const markAsRead = async (id) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
        if (notification.cta_url) {
            navigate(notification.cta_url);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`
                    fixed sm:absolute z-50
                    top-20 sm:top-full sm:mt-2
                    left-1/2 sm:left-auto ${align === 'left' ? 'sm:left-0' : 'sm:right-0'}
                    -translate-x-1/2 sm:translate-x-0
                    w-[calc(100vw-2rem)] sm:w-80 max-w-sm
                    bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden
                    animate-in fade-in slide-in-from-top-2 duration-200
                `}>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 text-sm">Notificações</h3>
                        {unreadCount > 0 && (
                            <span className="bg-pink-100 text-pink-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} Novas
                            </span>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center">
                                <Bell size={24} className="mb-2 opacity-20" />
                                <p>Nenhuma notificação por aqui.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.is_read ? 'bg-pink-50/30' : ''
                                            }`}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>
                                        )}
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {notification.type === 'plan_expiring' ? (
                                                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                                                        <AlertTriangle size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                                                        <Bell size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex justify-between items-center mt-2 text-xs">
                                                    <span className="text-gray-400">
                                                        {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                                                            day: '2-digit', month: 'short'
                                                        })}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="text-pink-600 font-semibold hover:text-pink-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                                        >
                                                            <Check size={12} />
                                                            Marcar Lida
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
