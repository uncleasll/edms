import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, FileCog, History, LogOut, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users } from 'lucide-react';

const INPUT = "w-full bg-slate-700/60 border border-slate-600/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";
const PAGE_SIZE = 8;

const emptyUser = {
  username: '',
  password: '1234',
  name: '',
  role: 'warehouse',
  department: '',
  position: '',
  active: true,
};

const emptyTemplate = {
  code: '',
  name: '',
  department: '',
  deadlineDays: 3,
  formKey: 'generic',
  fields: [
    { key: 'itemName', label: 'Nomi', type: 'text' },
    { key: 'qty', label: 'Miqdor', type: 'number' },
    { key: 'amount', label: 'Summa', type: 'number' },
  ],
  active: true,
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-slate-400 text-xs font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Pagination({ page, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);

  return (
    <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between gap-3">
      <div className="text-slate-500 text-xs">{from}-{to} / {total}</div>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-700/50 disabled:opacity-40">
          Oldingi
        </button>
        <span className="text-slate-400 text-xs">{page} / {pages}</span>
        <button onClick={() => onPageChange(Math.min(pages, page + 1))} disabled={page === pages}
          className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-700/50 disabled:opacity-40">
          Keyingi
        </button>
      </div>
    </div>
  );
}

function EmployeesTab() {
  const { currentUser, users, saveUser, deleteUser, refreshUsers } = useApp();
  const [selected, setSelected] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const employeePage = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async () => {
    setSaving(true);
    setMessage('');
    try {
      const saved = await saveUser(selected);
      setSelected({ ...saved, password: '' });
      setMessage(selected.password ? `Login: ${saved.username} | Parol: ${selected.password}` : 'Saqlandi');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected.id || selected.id === currentUser?.id) return;
    const ok = window.confirm(`${selected.name} akkauntini o'chirasizmi? Login yopiladi, eski hujjatlar saqlanadi.`);
    if (!ok) return;
    await deleteUser(selected.id);
    setSelected(emptyUser);
    setMessage("Hodim o'chirildi va login bloklandi");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="text-white font-semibold text-sm">Hodimlar</div>
          <button onClick={refreshUsers} className="text-slate-400 hover:text-white"><RefreshCw size={15}/></button>
        </div>
        <div className="divide-y divide-slate-700/40">
          {employeePage.map(user => (
            <button key={user.id} onClick={() => { setSelected({ ...user, password: '' }); setMessage(''); }}
              className={`w-full grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_80px] gap-2 px-4 py-3 text-left hover:bg-slate-700/30 ${!user.active ? 'opacity-55' : ''}`}>
              <div>
                <div className="text-white text-sm font-medium">{user.name}</div>
                <div className="text-slate-500 text-xs">@{user.username}</div>
              </div>
              <div className="text-slate-300 text-sm">{user.department}</div>
              <div className="text-slate-400 text-sm">{user.position}</div>
              <div className={`text-xs font-medium ${user.active ? 'text-green-400' : 'text-red-400'}`}>{user.active ? 'Active' : 'Inactive'}</div>
            </button>
          ))}
          {users.length === 0 && <div className="text-slate-500 text-center py-12">Hodimlar yo'q</div>}
        </div>
        <Pagination page={page} total={users.length} onPageChange={setPage}/>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold text-sm">{selected.id ? 'Edit hodim' : 'Yangi hodim'}</div>
          <button onClick={() => setSelected(emptyUser)} className="text-blue-400 hover:text-blue-300"><Plus size={16}/></button>
        </div>
        <Field label="Login"><input className={INPUT} value={selected.username || ''} onChange={e => setSelected({ ...selected, username: e.target.value })}/></Field>
        <Field label={selected.id ? "Yangi parol berish" : "Boshlang'ich parol"}>
          <input className={INPUT} value={selected.password || ''} onChange={e => setSelected({ ...selected, password: e.target.value })} placeholder={selected.id ? "O'zgarmasa bo'sh qoldiring" : '1234'}/>
        </Field>
        <Field label="Ism familiya"><input className={INPUT} value={selected.name || ''} onChange={e => setSelected({ ...selected, name: e.target.value })}/></Field>
        <Field label="Role">
          <select className={INPUT} value={selected.role || 'warehouse'} onChange={e => setSelected({ ...selected, role: e.target.value })}>
            <option value="director">director</option>
            <option value="warehouse">warehouse</option>
            <option value="production">production</option>
            <option value="planning">planning</option>
            <option value="reprocessing">reprocessing</option>
            <option value="finished">finished</option>
          </select>
        </Field>
        <Field label="Bo'lim"><input className={INPUT} value={selected.department || ''} onChange={e => setSelected({ ...selected, department: e.target.value })}/></Field>
        <Field label="Lavozim"><input className={INPUT} value={selected.position || ''} onChange={e => setSelected({ ...selected, position: e.target.value })}/></Field>
        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input type="checkbox" checked={Boolean(selected.active)} onChange={e => setSelected({ ...selected, active: e.target.checked })}/>
          Active
        </label>
        {message && <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl px-3 py-2 text-xs break-words">{message}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={submit} disabled={saving || !selected.username || !selected.name}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
            <Save size={15}/> Saqlash
          </button>
          <button onClick={remove} disabled={!selected.id || selected.id === currentUser?.id}
            className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded-xl py-2.5 text-sm font-medium disabled:opacity-40">
            <Trash2 size={15}/> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplatesTab() {
  const { templates, saveTemplate, refreshTemplates } = useApp();
  const [selected, setSelected] = useState(emptyTemplate);
  const [fieldsText, setFieldsText] = useState(JSON.stringify(emptyTemplate.fields, null, 2));
  const [page, setPage] = useState(1);
  const templatePage = templates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const choose = (template) => {
    setSelected(template);
    setFieldsText(JSON.stringify(template.fields || [], null, 2));
  };

  const submit = async () => {
    const payload = { ...selected, fields: JSON.parse(fieldsText || '[]') };
    const saved = await saveTemplate(payload);
    choose(saved);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="text-white font-semibold text-sm">Hujjat shakllari</div>
          <button onClick={refreshTemplates} className="text-slate-400 hover:text-white"><RefreshCw size={15}/></button>
        </div>
        <div className="divide-y divide-slate-700/40">
          {templatePage.map(template => (
            <button key={template.id} onClick={() => choose(template)}
              className="w-full grid grid-cols-1 md:grid-cols-[110px_1.4fr_1fr_80px] gap-2 px-4 py-3 text-left hover:bg-slate-700/30">
              <div className="text-blue-400 text-sm font-bold">{template.code}</div>
              <div className="text-white text-sm">{template.name}</div>
              <div className="text-slate-400 text-sm">{template.department}</div>
              <div className="text-slate-500 text-xs">{template.deadlineDays} kun</div>
            </button>
          ))}
          {templates.length === 0 && <div className="text-slate-500 text-center py-12">Hujjat shakllari yo'q</div>}
        </div>
        <Pagination page={page} total={templates.length} onPageChange={setPage}/>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold text-sm">{selected.id ? 'Edit shakl' : 'Yangi shakl'}</div>
          <button onClick={() => { setSelected(emptyTemplate); setFieldsText(JSON.stringify(emptyTemplate.fields, null, 2)); }} className="text-blue-400 hover:text-blue-300"><Plus size={16}/></button>
        </div>
        <Field label="Kod"><input className={INPUT} value={selected.code || ''} onChange={e => setSelected({ ...selected, code: e.target.value })}/></Field>
        <Field label="Nomi"><input className={INPUT} value={selected.name || ''} onChange={e => setSelected({ ...selected, name: e.target.value })}/></Field>
        <Field label="Bo'lim"><input className={INPUT} value={selected.department || ''} onChange={e => setSelected({ ...selected, department: e.target.value })}/></Field>
        <Field label="Muddat kun"><input className={INPUT} type="number" value={selected.deadlineDays || 1} onChange={e => setSelected({ ...selected, deadlineDays: Number(e.target.value) })}/></Field>
        <Field label="Form type">
          <select className={INPUT} value={selected.formKey || 'generic'} onChange={e => setSelected({ ...selected, formKey: e.target.value })}>
            <option value="generic">generic</option>
            <option value="xb1">XB-1</option>
            <option value="ombor1">01-QQD</option>
            <option value="production">production</option>
          </select>
        </Field>
        <Field label="Fields JSON">
          <textarea className={`${INPUT} min-h-36 font-mono text-xs`} value={fieldsText} onChange={e => setFieldsText(e.target.value)}/>
        </Field>
        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input type="checkbox" checked={Boolean(selected.active)} onChange={e => setSelected({ ...selected, active: e.target.checked })}/>
          Active
        </label>
        <button onClick={submit} disabled={!selected.code || !selected.name}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
          <Save size={15}/> Saqlash
        </button>
      </div>
    </div>
  );
}

function AuditTab() {
  const { getAuditLogs } = useApp();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => setItems(await getAuditLogs()), [getAuditLogs]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="text-white font-semibold text-sm">Audit log</div>
        <button onClick={load} className="text-slate-400 hover:text-white"><RefreshCw size={15}/></button>
      </div>
      <div className="divide-y divide-slate-700/40">
        {items.map(item => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-[170px_160px_1fr_180px] gap-2 px-4 py-3">
            <div className="text-slate-500 text-xs">{new Date(item.createdAt).toLocaleString()}</div>
            <div className="text-blue-400 text-sm font-medium">{item.action}</div>
            <div className="text-slate-300 text-sm">{item.entityType}: {item.entityId}</div>
            <div className="text-slate-500 text-xs">{item.actorName || 'System'}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-500 text-center py-12">Audit yozuvlari yo'q</div>}
      </div>
    </div>
  );
}

export default function AdminPage({ onBack }) {
  const { currentUser, logout } = useApp();
  const [tab, setTab] = useState('employees');

  if (currentUser?.role !== 'director') {
    return <div className="p-6 text-slate-400">Faqat rahbar uchun.</div>;
  }

  const tabs = [
    { key: 'employees', label: 'Hodimlar', icon: Users },
    { key: 'templates', label: 'Hujjat shakllari', icon: FileCog },
    { key: 'audit', label: 'Audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col">
        <div className="h-16 px-4 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-sm">EDMS Admin</div>
            <div className="text-slate-500 text-xs">Management console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${tab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={17}/>{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700/50 space-y-2">
          <div className="px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{currentUser?.avatar}</div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{currentUser?.name}</div>
              <div className="text-slate-500 text-xs truncate">{currentUser?.role}</div>
            </div>
          </div>
          <button onClick={onBack}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white text-sm">
            <ArrowLeft size={17}/> EDMS ga qaytish
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm">
            <LogOut size={17}/> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="h-16 border-b border-slate-700/50 bg-slate-950/80 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-bold">Admin panel</h1>
            <p className="text-slate-500 text-xs">Hodimlar, hujjat shakllari, valyuta qoidalari va audit boshqaruvi.</p>
          </div>
          <div className="text-xs text-slate-500">/admin</div>
        </div>
        <div className="p-6">
          {tab === 'employees' && <EmployeesTab/>}
          {tab === 'templates' && <TemplatesTab/>}
          {tab === 'audit' && <AuditTab/>}
        </div>
      </main>
      </div>
  );
}
