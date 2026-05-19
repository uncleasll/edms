import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import AIAssistant from './pages/AIAssistant';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

const PAGE_TO_PATH = {
  dashboard: '/',
  documents: '/documents',
  reports: '/reports',
  admin: '/admin',
  ai: '/ai',
  settings: '/settings',
  notifications: '/notifications',
};

const PATH_TO_PAGE = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/documents': 'documents',
  '/reports': 'reports',
  '/admin': 'admin',
  '/ai': 'ai',
  '/settings': 'settings',
  '/notifications': 'notifications',
};

function pageFromPath() {
  return PATH_TO_PAGE[window.location.pathname] || 'dashboard';
}

function AppShell() {
  const { currentUser, initializing } = useApp();
  const [currentPage, setCurrentPageState] = useState(pageFromPath);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onPopState = () => setCurrentPageState(pageFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    const path = PAGE_TO_PATH[page] || '/';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'director' && currentPage === 'admin') {
      setCurrentPageState('dashboard');
      window.history.replaceState({}, '', '/');
    }
  }, [currentUser, currentPage]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span className="w-5 h-5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin mr-3"/>
        Loading EDMS...
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  if (currentPage === 'admin' && currentUser.role !== 'director') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center">
          <div className="text-white font-bold text-lg">Admin panel yopiq</div>
          <p className="text-slate-400 text-sm mt-2">Bu panelga faqat direktor akkaunti kira oladi.</p>
          <button onClick={() => setCurrentPage('dashboard')}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium">
            Asosiy tizimga qaytish
          </button>
        </div>
      </div>
    );
  }

  const PAGE_MAP = {
    dashboard: <Dashboard setCurrentPage={setCurrentPage}/>,
    documents: <DocumentsPage/>,
    reports: <ReportsPage/>,
    ai: <AIAssistant/>,
    settings: <SettingsPage/>,
    notifications: <NotificationsPage/>,
  };

  if (currentPage === 'admin') {
    return <AdminPage onBack={() => setCurrentPage('dashboard')}/>;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <main className="flex-1 overflow-y-auto">
        {PAGE_MAP[currentPage] || <Dashboard setCurrentPage={setCurrentPage}/>}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell/>
    </AppProvider>
  );
}
