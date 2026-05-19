import { useApp } from '../context/AppContext';
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

const ICON_MAP = {
  overdue: { icon: AlertTriangle, cls: 'text-red-400 bg-red-500/10' },
  pending: { icon: Clock, cls: 'text-amber-400 bg-amber-500/10' },
  success: { icon: CheckCircle, cls: 'text-green-400 bg-green-500/10' },
  info: { icon: Info, cls: 'text-blue-400 bg-blue-500/10' },
};

export default function NotificationsPage() {
  const { t, notifications, markNotificationsRead } = useApp();
  
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">{t('notifications')}</h1>
        <button onClick={markNotificationsRead} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Barchasini o'qildi deb belgilash</button>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><Bell size={40} className="mx-auto mb-3 opacity-30"/><p>Bildirishnomalar yo'q</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const { icon: Icon, cls } = ICON_MAP[n.type] || ICON_MAP.info;
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.read ? 'bg-slate-800/30 border-slate-700/30' : 'bg-slate-800/70 border-slate-700/60'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                  <Icon size={16}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.read ? 'text-slate-400' : 'text-white font-medium'}`}>{n.message}</div>
                  <div className="text-slate-500 text-xs mt-1">{new Date(n.time).toLocaleString()}</div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"/>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
