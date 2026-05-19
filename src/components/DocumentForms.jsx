import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Send, Unlock, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const INPUT_CLS = "bg-slate-700/50 border border-slate-600/50 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 w-full placeholder-slate-500";
const LABEL_CLS = "text-slate-400 text-xs font-medium mb-1 block";

function StatusBadge({ status, t }) {
  const MAP = {
    draft: { cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Clock size={10}/> },
    pending: { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Clock size={10}/> },
    signed: { cls: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle size={10}/> },
    approved: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <CheckCircle size={10}/> },
    rejected: { cls: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <AlertCircle size={10}/> },
  };
  const m = MAP[status] || MAP.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${m.cls}`}>
      {m.icon}{t(status)}
    </span>
  );
}

function DeadlineBadge({ deadline, status, t, getDaysOverdue }) {
  if (status === 'approved' || status === 'signed') return null;
  const days = getDaysOverdue(deadline);
  if (days > 0) return <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full"><AlertCircle size={10}/>{days} {t('daysLate')}</span>;
  if (days === 0) return <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{t('today')}</span>;
  return <span className="text-xs text-slate-400">{Math.abs(days)} {t('daysLeft')}</span>;
}

// Generic table row editor
function MoneyHint({ currency }) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
      <div className="text-blue-300 text-sm font-semibold">Summa valyutasi: {currency || 'UZS'}</div>
      <div className="text-slate-400 text-xs mt-1">Hodim summa kiritadi. Valyutani faqat rahbar o'zgartira oladi.</div>
    </div>
  );
}

function formatCellValue(row, column, currency) {
  const value = row[column.key];
  if (value === undefined || value === null || value === '') return '';
  if (column.key === 'amount') return `${value} ${currency || 'UZS'}`;
  return value;
}

function TableEditor({ rows, setRows, columns, currency }) {
  const addRow = () => {
    const newRow = { id: Date.now() };
    columns.forEach(c => { newRow[c.key] = ''; });
    newRow.no = rows.length + 1;
    setRows([...rows, newRow]);
  };
  const removeRow = (id) => setRows(rows.filter(r => r.id !== id));
  const updateRow = (id, key, val) => setRows(rows.map(r => r.id === id ? { ...r, [key]: val } : r));

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/50">
              {columns.map(c => (
                <th key={c.key} className="text-left text-slate-300 font-medium px-3 py-2.5 text-xs whitespace-nowrap">
                  {c.label}{c.key === 'amount' ? ` (${currency || 'UZS'})` : ''}
                </th>
              ))}
              <th className="px-2 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-t border-slate-700/30 hover:bg-slate-700/20">
                {columns.map(c => (
                  <td key={c.key} className="px-2 py-1.5">
                    {c.key === 'no' ? <span className="text-slate-400 text-xs px-1">{idx + 1}</span> :
                      <input value={row[c.key] || ''} onChange={e => updateRow(row.id, c.key, e.target.value)}
                        className="bg-transparent border-b border-slate-600/50 text-white text-xs py-1 px-1 focus:outline-none focus:border-blue-400 w-full min-w-[60px]"
                        type={c.type || 'text'} placeholder={c.placeholder || (c.key === 'amount' ? `0 ${currency || 'UZS'}` : '')}/>}
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button onClick={() => removeRow(row.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="text-center text-slate-500 text-xs py-6">Qator yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
        <Plus size={14}/> Qator qo'shish
      </button>
    </div>
  );
}

function ReadOnlyTable({ rows, columns, currency }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700/50">
            {columns.map(c => (
              <th key={c.key} className="text-left text-slate-300 font-medium px-3 py-2.5 text-xs whitespace-nowrap">
                {c.label}{c.key === 'amount' ? ` (${currency || 'UZS'})` : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((r, i) => (
            <tr key={i} className="border-t border-slate-700/30">
              {columns.map(c => <td key={c.key} className="px-3 py-2 text-slate-300 text-xs whitespace-nowrap">{formatCellValue(r, c, currency)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Signature block
function SignatureBlock({ doc, onSign, onRequestEdit, canEdit, t }) {
  const { currentUser } = useApp();
  const alreadySigned = (doc.signatures || []).some(s => s.userId === currentUser?.id);
  const pendingEditReq = (doc.editRequests || []).some(r => r.userId === currentUser?.id && r.status === 'pending');

  return (
    <div className="border-t border-slate-700/50 pt-5 mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="text-slate-400 text-xs mb-2">{t('digitalSignature')}</div>
          <div className="flex flex-wrap gap-2">
            {(doc.signatures || []).map((sig, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <CheckCircle size={12} className="text-green-400"/>
                <span className="text-green-400 text-xs font-medium">{sig.name}</span>
                <span className="text-slate-500 text-xs">{new Date(sig.time).toLocaleDateString()}</span>
              </div>
            ))}
            {doc.signatures?.length === 0 && <span className="text-slate-500 text-xs">{t('signatureRequired')}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!alreadySigned && doc.status !== 'approved' && (
            <button onClick={onSign} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
              <CheckCircle size={14}/>{t('sign')}
            </button>
          )}
          {(doc.status === 'signed' || doc.status === 'approved') && !canEdit && !pendingEditReq && (
            <button onClick={onRequestEdit} className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-xl px-4 py-2 transition-all">
              <Unlock size={14}/>{t('requestEdit')}
            </button>
          )}
          {pendingEditReq && (
            <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 text-slate-400 text-sm rounded-xl px-4 py-2">
              <Clock size={14}/>{t('adminApproval')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ SPECIFIC FORM TYPES ============

export function FormXB1({ doc, onSave }) {
  const { t, signDocument, requestEdit, canEditDocument, getDaysOverdue } = useApp();
  const [rows, setRows] = useState(doc.rows || []);
  const editable = canEditDocument(doc);

  const cols = [
    { key: 'no', label: '№' },
    { key: 'date', label: t('date'), type: 'date' },
    { key: 'rawMaterial', label: t('rawMaterial') },
    { key: 'type', label: t('type') },
    { key: 'unit', label: t('unit') },
    { key: 'quantity', label: t('quantity'), type: 'number' },
    { key: 'supplier', label: t('supplier') },
    { key: 'department', label: t('department') },
    { key: 'note', label: 'Eslatma' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">{doc.typeId}</span>
            <StatusBadge status={doc.status} t={t}/>
            <DeadlineBadge deadline={doc.deadline} status={doc.status} t={t} getDaysOverdue={getDaysOverdue}/>
          </div>
          <h3 className="text-white font-bold mt-1">Xom ashyo buyurtma shakli</h3>
          <p className="text-slate-400 text-xs">Muddat: {doc.deadline}</p>
        </div>
        {editable && (
          <button onClick={() => onSave({ ...doc, rows, status: 'pending' })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
            <Send size={14}/>{t('submit')}
          </button>
        )}
      </div>
      {editable ? <TableEditor rows={rows} setRows={setRows} columns={cols} currency={doc.currency}/> : <ReadOnlyTable rows={doc.rows} columns={cols} currency={doc.currency}/>}
      <SignatureBlock doc={doc} onSign={() => signDocument(doc.id)} onRequestEdit={() => requestEdit(doc.id)} canEdit={editable} t={t} getDaysOverdue={getDaysOverdue}/>
    </div>
  );
}

export function FormOmbor1({ doc, onSave }) {
  const { t, signDocument, requestEdit, canEditDocument, getDaysOverdue } = useApp();
  const [supplier, setSupplier] = useState(doc.supplier || '');
  const [receiver, setReceiver] = useState(doc.receiver || '');
  const [ttnNo, setTtnNo] = useState(doc.ttnNo || '');
  const [rows, setRows] = useState(doc.rows || []);
  const editable = canEditDocument(doc);

  const cols = [
    { key: 'no', label: '№' }, { key: 'date', label: t('date'), type: 'date' },
    { key: 'itemName', label: t('item') }, { key: 'type', label: t('type') }, { key: 'unit', label: t('unit') },
    { key: 'docQty', label: t('docQuantity'), type: 'number' }, { key: 'actualQty', label: t('actualQuantity'), type: 'number' },
    { key: 'diff', label: t('difference'), type: 'number' }, { key: 'defect', label: t('defect'), type: 'number' }, { key: 'otherReturn', label: 'Boshqa sabab' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-blue-400 font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">{doc.typeId}</span>
        <StatusBadge status={doc.status} t={t}/>
        <DeadlineBadge deadline={doc.deadline} status={doc.status} t={t} getDaysOverdue={getDaysOverdue}/>
      </div>
      <h3 className="text-white font-bold">Xaridlarni qabul qilish dalolatnomasi</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['supplier', t('supplier'), supplier, setSupplier], ['receiver', t('receiver'), receiver, setReceiver], ['ttnNo', t('ttnNumber'), ttnNo, setTtnNo]].map(([k, label, val, set]) => (
          <div key={k}>
            <label className={LABEL_CLS}>{label}</label>
            {editable ? <input value={val} onChange={e => set(e.target.value)} className={INPUT_CLS} placeholder={label}/> : <div className="text-slate-300 text-sm py-1">{val || '—'}</div>}
          </div>
        ))}
      </div>
      {editable ? <TableEditor rows={rows} setRows={setRows} columns={cols} currency={doc.currency}/> : <ReadOnlyTable rows={doc.rows} columns={cols} currency={doc.currency}/>}
      {editable && (
        <button onClick={() => onSave({ ...doc, supplier, receiver, ttnNo, rows, status: 'pending' })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
          <Send size={14}/>{t('submit')}
        </button>
      )}
      <SignatureBlock doc={doc} onSign={() => signDocument(doc.id)} onRequestEdit={() => requestEdit(doc.id)} canEdit={editable} t={t} getDaysOverdue={getDaysOverdue}/>
    </div>
  );
}

export function FormProductionReport({ doc, onSave }) {
  const { t, signDocument, requestEdit, canEditDocument, getDaysOverdue } = useApp();
  const [month, setMonth] = useState(doc.month || '');
  const [rows, setRows] = useState(doc.rows || []);
  const editable = canEditDocument(doc);

  const cols = [
    { key: 'no', label: '№' }, { key: 'model', label: t('model') }, { key: 'name', label: 'Nomi' },
    { key: 'ordered', label: t('ordered'), type: 'number' }, { key: 'produced', label: t('produced'), type: 'number' },
    { key: 'diff', label: t('difference'), type: 'number' }, { key: 'reprocessed', label: t('reprocessed'), type: 'number' },
    { key: 'defects', label: t('defect'), type: 'number' }, { key: 'waste', label: 'Chiqim', type: 'number' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-blue-400 font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">{doc.typeId}</span>
        <StatusBadge status={doc.status} t={t}/>
        <DeadlineBadge deadline={doc.deadline} status={doc.status} t={t} getDaysOverdue={getDaysOverdue}/>
      </div>
      <h3 className="text-white font-bold">{doc.typeId === '1-ICHH' ? '1-Ishlab chiqarish sexi hisoboti' : doc.typeId === '3-ICHH' ? '3-Ishlab chiqarish sexi hisoboti' : 'Ishlab chiqarish hisoboti'}</h3>
      <div>
        <label className={LABEL_CLS}>Oy</label>
        {editable ? <input value={month} onChange={e => setMonth(e.target.value)} className={`${INPUT_CLS} max-w-xs`} placeholder="Masalan: May 2025"/> : <div className="text-slate-300 text-sm">{month || '—'}</div>}
      </div>
      {editable ? <TableEditor rows={rows} setRows={setRows} columns={cols} currency={doc.currency}/> : <ReadOnlyTable rows={doc.rows} columns={cols} currency={doc.currency}/>}
      {editable && (
        <button onClick={() => onSave({ ...doc, month, rows, status: 'pending' })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
          <Send size={14}/>{t('submit')}
        </button>
      )}
      <SignatureBlock doc={doc} onSign={() => signDocument(doc.id)} onRequestEdit={() => requestEdit(doc.id)} canEdit={editable} t={t} getDaysOverdue={getDaysOverdue}/>
    </div>
  );
}

export function FormGeneric({ doc, onSave }) {
  const { t, templates, signDocument, requestEdit, canEditDocument, getDaysOverdue } = useApp();
  const [rows, setRows] = useState(doc.rows || []);
  const editable = canEditDocument(doc);
  const template = templates.find(item => item.id === doc.typeId);

  const fallbackCols = [
    { key: 'no', label: '№' }, { key: 'itemName', label: 'Nomi' }, { key: 'type', label: t('type') },
    { key: 'unit', label: t('unit') }, { key: 'qty', label: t('quantity'), type: 'number' },
    { key: 'amount', label: 'Summa', type: 'number' }, { key: 'note', label: 'Izoh' },
  ];
  const cols = [
    { key: 'no', label: '№' },
    ...((template?.fields?.length ? template.fields : fallbackCols.filter(c => c.key !== 'no'))
      .filter(c => c.key !== 'id' && c.key !== 'no')),
  ];
  const hasAmount = cols.some(c => c.key === 'amount');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-blue-400 font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">{doc.typeId}</span>
        <StatusBadge status={doc.status} t={t}/>
        <DeadlineBadge deadline={doc.deadline} status={doc.status} t={t} getDaysOverdue={getDaysOverdue}/>
      </div>
      <h3 className="text-white font-bold">{doc.title}</h3>
      <p className="text-slate-400 text-xs">Muddat: {doc.deadline}</p>
      {hasAmount && <MoneyHint currency={doc.currency}/>}
      {editable ? <TableEditor rows={rows} setRows={setRows} columns={cols} currency={doc.currency}/> : <ReadOnlyTable rows={doc.rows} columns={cols} currency={doc.currency}/>}
      {editable && (
        <button onClick={() => onSave({ ...doc, rows, status: 'pending' })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
          <Send size={14}/>{t('submit')}
        </button>
      )}
      <SignatureBlock doc={doc} onSign={() => signDocument(doc.id)} onRequestEdit={() => requestEdit(doc.id)} canEdit={editable} t={t} getDaysOverdue={getDaysOverdue}/>
    </div>
  );
}
