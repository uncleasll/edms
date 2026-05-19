import { useApp } from '../context/AppContext';
import { DOCUMENT_TYPES } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  const { t, documents, getDaysOverdue, currentUser } = useApp();

  const allDocs = currentUser?.role === 'director' ? documents : documents.filter(d => d.createdBy === currentUser?.id);

  const byType = DOCUMENT_TYPES.map(dt => ({
    name: dt.code,
    count: allDocs.filter(d => d.typeId === dt.id).length,
    overdue: allDocs.filter(d => d.typeId === dt.id && getDaysOverdue(d.deadline) > 0 && d.status !== 'approved' && d.status !== 'signed').length,
  })).filter(d => d.count > 0);

  const byStatus = ['draft', 'pending', 'signed', 'approved', 'rejected'].map(s => ({
    name: t(s), count: allDocs.filter(d => d.status === s).length
  }));

  const overdueList = allDocs.filter(d => getDaysOverdue(d.deadline) > 0 && d.status !== 'approved' && d.status !== 'signed')
    .map(d => ({ ...d, days: getDaysOverdue(d.deadline) }))
    .sort((a, b) => b.days - a.days);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-xl font-bold">{t('reports')}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami', value: allDocs.length, cls: 'text-blue-400' },
          { label: t('pending'), value: allDocs.filter(d => d.status === 'pending').length, cls: 'text-amber-400' },
          { label: t('overdueDocs'), value: overdueList.length, cls: 'text-red-400' },
          { label: t('completedDocs'), value: allDocs.filter(d => d.status === 'approved' || d.status === 'signed').length, cls: 'text-green-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className={`text-3xl font-bold ${cls}`}>{value}</div>
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-blue-400"/>Hujjat turlari bo'yicha</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byType} barSize={20}>
              <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} angle={-30} textAnchor="end" height={40}/>
              <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 11}}/>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}/>
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Jami"/>
              <Bar dataKey="overdue" fill="#ef4444" radius={[4,4,0,0]} name="Kechikkan"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><CheckCircle size={15} className="text-green-400"/>Holat bo'yicha</h3>
          <div className="space-y-3 mt-4">
            {byStatus.filter(s => s.count > 0).map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-24 flex-shrink-0">{s.name}</span>
                <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${(s.count / allDocs.length) * 100}%`}}/>
                </div>
                <span className="text-white text-xs font-medium w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue details */}
      {overdueList.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><AlertTriangle size={15} className="text-red-400"/>{t('overdueDocs')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Hujjat raqami', 'Turi', 'Holat', 'Muddat', 'Kechikish'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium text-xs pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueList.map(doc => {
                  const dt = DOCUMENT_TYPES.find(d => d.id === doc.typeId);
                  return (
                    <tr key={doc.id} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                      <td className="py-2.5 pr-4 text-white font-medium">{doc.docNumber}</td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs whitespace-nowrap">{dt?.code}</td>
                      <td className="py-2.5 pr-4"><span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{t(doc.status)}</span></td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">{doc.deadline}</td>
                      <td className="py-2.5 text-red-400 font-bold text-sm">{doc.days} {t('daysLate')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
