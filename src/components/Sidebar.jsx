import { useApp } from '../context/AppContext';
import { LayoutDashboard, FileText, BarChart3, Settings, Bot, LogOut, ChevronRight, Bell } from 'lucide-react';

const BASE_NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { key: 'documents', icon: FileText, page: 'documents' },
  { key: 'reports', icon: BarChart3, page: 'reports' },
  { key: 'aiAssistant', icon: Bot, page: 'ai' },
  { key: 'settings', icon: Settings, page: 'settings' },
];

export default function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }) {
  const { t, currentUser, logout, notifications } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  const navItems = BASE_NAV_ITEMS;

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-white"/>
          </div>
          {!collapsed && <span className="text-white font-bold text-sm truncate">EDMS</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className={`ml-auto text-slate-400 hover:text-white transition-colors flex-shrink-0 ${collapsed ? '' : ''}`}>
          <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ key, icon: Icon, page }) => (
          <button key={key} onClick={() => setCurrentPage(page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
              ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon size={18} className="flex-shrink-0"/>
            {!collapsed && <span className="truncate">{t(key)}</span>}
            {key === 'aiAssistant' && !collapsed && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md">AI</span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                {t(key)}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="p-2 border-t border-slate-700/50 space-y-1">
        <button onClick={() => setCurrentPage('notifications')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm relative">
          <Bell size={18} className="flex-shrink-0"/>
          {!collapsed && <span>{t('notifications')}</span>}
          {unread > 0 && <span className="absolute top-1.5 left-5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
        </button>
        {!collapsed && (
          <div className="px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{currentUser?.avatar}</div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">{currentUser?.name}</div>
              <div className="text-slate-400 text-xs truncate">{currentUser?.department}</div>
            </div>
          </div>
        )}
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm">
          <LogOut size={18} className="flex-shrink-0"/>
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
