import { useApp } from '../context/AppContext';
import { FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DOCUMENT_TYPES } from '../data/mockData';

const STATUS_COLORS = {
  signed: '#22c55e', approved: '#3b82f6', pending: '#f59e0b', draft: '#94a3b8', rejected: '#ef4444'
};

export default function Dashboard({ setCurrentPage }) {
  const { t, getDaysOverdue, currentUser, getUserDocuments } = useApp();
  const myDocs = getUserDocuments();

  const stats = {
    total: myDocs.length,
    pending: myDocs.filter(d => d.status === 'pending').length,
    overdue: myDocs.filter(d => getDaysOverdue(d.deadline) > 0 && d.status !== 'approved' && d.status !== 'signed').length,
    completed: myDocs.filter(d => d.status === 'approved' || d.status === 'signed').length,
  };

  const overdueDocs = myDocs.filter(d => getDaysOverdue(d.deadline) > 0 && d.status !== 'approved' && d.status !== 'signed')
    .sort((a, b) => getDaysOverdue(b.deadline) - getDaysOverdue(a.deadline));

  const statusData = ['draft', 'pending', 'signed', 'approved', 'rejected'].map(s => ({
    name: t(s), value: myDocs.filter(d => d.status === s).length, color: STATUS_COLORS[s]
  })).filter(d => d.value > 0);

  const monthData = (() => {
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'];
    return months.map((m, i) => ({ name: m, docs: ((i + 2) * 3) % 9 + 2 }));
  })();

  const STAT_CARDS = [
    { label: t('totalDocuments'), value: stats.total, icon: FileText, color: 'blue', bg: 'bg-blue-500/10 border-blue-500/20', icon_color: 'text-blue-400' },
    { label: t('pendingDocs'), value: stats.pending, icon: Clock, color: 'amber', bg: 'bg-amber-500/10 border-amber-500/20', icon_color: 'text-amber-400' },
    { label: t('overdueDocs'), value: stats.overdue, icon: AlertTriangle, color: 'red', bg: 'bg-red-500/10 border-red-500/20', icon_color: 'text-red-400' },
    { label: t('completedDocs'), value: stats.completed, icon: CheckCircle, color: 'green', bg: 'bg-green-500/10 border-green-500/20', icon_color: 'text-green-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">{t('welcomeBack')}, {currentUser?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400 text-sm mt-0.5">{currentUser?.department} · {currentUser?.position}</p>
        </div>
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <Calendar size={14}/>{new Date().toLocaleDateString('uz-UZ')}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, bg, icon_color }) => (
          <div key={label} className={`${bg} border rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={icon_color}/>
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{value}</div>
              <div className="text-slate-400 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overdue list */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-400"/>
            <h2 className="text-white font-semibold text-sm">{t('overdueAlert')}</h2>
            {overdueDocs.length > 0 && <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{overdueDocs.length}</span>}
          </div>
          {overdueDocs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2 opacity-60"/>
              <p className="text-slate-400 text-sm">Kechikkan hujjatlar yo'q!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueDocs.slice(0, 5).map(doc => {
                const days = getDaysOverdue(doc.deadline);
                const docType = DOCUMENT_TYPES.find(dt => dt.id === doc.typeId);
                return (
                  <div key={doc.id} onClick={() => setCurrentPage('documents')}
                    className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-red-500/10 transition-all">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-red-400"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{doc.docNumber}</div>
                      <div className="text-slate-400 text-xs truncate">{docType?.name}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-400 text-sm font-bold">{days} {t('daysLate')}</div>
                      <div className="text-slate-500 text-xs">{doc.deadline}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">{t('status')}</h2>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background: s.color}}/>
                      <span className="text-slate-400">{s.name}</span>
                    </div>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-slate-500 text-sm text-center py-10">Ma'lumot yo'q</div>}
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-400"/>
          <h2 className="text-white font-semibold text-sm">2025 - Hujjatlar statistikasi</h2>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={monthData} barSize={28}>
            <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}}/>
            <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}}/>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}/>
            <Bar dataKey="docs" fill="#3b82f6" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
