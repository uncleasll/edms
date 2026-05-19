import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { FormXB1, FormOmbor1, FormProductionReport, FormGeneric } from '../components/DocumentForms';
import { DOCUMENT_TYPES } from '../data/mockData';
import { Search, Plus, FileText, ChevronRight, AlertTriangle, X, Download, Upload, FileSpreadsheet } from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label_uz: 'Qoralama', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  pending: { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  signed: { cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  approved: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  rejected: { cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const PAGE_SIZE = 8;

function Pagination({ page, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);

  return (
    <div className="flex items-center justify-between gap-3 border border-slate-700/50 bg-slate-800/40 rounded-2xl px-4 py-3">
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

function NewDocModal({ onClose, onAdd }) {
  const { t, currentUser, templates } = useApp();
  const [selectedType, setSelectedType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const docTypes = templates.length > 0 ? templates.filter(item => item.active) : DOCUMENT_TYPES;

  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };

  const handleAdd = async () => {
    const dt = docTypes.find(d => d.id === selectedType);
    if (!dt || !docNumber) return;
    await onAdd({
      typeId: dt.id, docNumber, title: dt.name, status: 'draft', currency,
      createdBy: currentUser.id, deadline: addDays(dt.deadlineDays), department: currentUser.department, rows: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">{t('newDocument')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t('docType')}</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              <option value="">— Tanlang —</option>
              {docTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.code} - {dt.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Valyuta</label>
            {currentUser?.role === 'director' ? (
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                <option value="UZS">UZS - so'm</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            ) : (
              <div className="bg-slate-700/60 border border-slate-600 text-slate-300 rounded-xl px-3 py-2.5 text-sm">UZS - so'm</div>
            )}
            <div className="text-slate-500 text-xs mt-1.5">
              Summa shu valyutada saqlanadi. Valyutani faqat rahbar tanlaydi.
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t('documentNo')}</label>
            <input value={docNumber} onChange={e => setDocNumber(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 placeholder-slate-500"
              placeholder="Masalan: 01-QQD-050"/>
          </div>
          {selectedType && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-slate-300">
              <div><span className="text-slate-500">Bo'lim:</span> {docTypes.find(d => d.id === selectedType)?.department}</div>
              <div><span className="text-slate-500">Muddat:</span> {docTypes.find(d => d.id === selectedType)?.deadlineDays} kun</div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-600 text-slate-400 rounded-xl py-2.5 text-sm hover:bg-slate-700 transition-all">{t('cancel')}</button>
            <button onClick={handleAdd} disabled={!selectedType || !docNumber}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-40">{t('save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocForm({ doc, onSave, onClose }) {
  const { currentUser, downloadDocument, downloadDocumentExcel, uploadAttachment, importDocumentExcel, downloadAttachment } = useApp();
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [currency, setCurrency] = useState(doc.currency || 'UZS');
  const FORM_MAP = { 'XB-1': FormXB1, '01-QQD': FormOmbor1, '1-ICHH': FormProductionReport, '3-ICHH': FormProductionReport };
  const Form = FORM_MAP[doc.typeId] || FormGeneric;

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAttachment(doc.id, file);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await importDocumentExcel(doc.id, file);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCurrencyChange = async (nextCurrency) => {
    setCurrency(nextCurrency);
    await onSave({ ...doc, currency: nextCurrency });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-white font-bold text-sm truncate">{doc.docNumber}</div>
            {currentUser?.role === 'director' ? (
              <select value={currency} onChange={e => handleCurrencyChange(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-400">
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            ) : (
              <span className="text-xs text-slate-400 bg-slate-700/60 border border-slate-600 rounded-lg px-2 py-1">{doc.currency || 'UZS'}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadDocumentExcel(doc.id)} title="Download Excel"
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all">
              <FileSpreadsheet size={17}/>
            </button>
            <button onClick={() => excelInputRef.current?.click()} disabled={uploading} title="Import Excel rows"
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50">
              <Upload size={17}/>
            </button>
            <input ref={excelInputRef} type="file" accept=".xlsx" onChange={handleExcelImport} className="hidden"/>
            <button onClick={() => downloadDocument(doc.id)} title="Download document"
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all">
              <Download size={17}/>
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload file"
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50">
              <Upload size={17}/>
            </button>
            <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden"/>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6">
          {(doc.attachments || []).length > 0 && (
            <div className="mb-4 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-slate-700/30 px-4 py-2 text-slate-300 text-xs font-medium">Attached files</div>
              <div className="divide-y divide-slate-700/40">
                {doc.attachments.map(file => (
                  <button key={file.id} onClick={() => downloadAttachment(file)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-700/30 text-left transition-all">
                    <span className="text-slate-200 text-sm truncate">{file.originalName}</span>
                    <span className="text-slate-500 text-xs flex-shrink-0">{Math.ceil(file.size / 1024)} KB</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Form doc={doc} onSave={onSave}/>
        </div>
      </div>
    </div>
  );
}

// Director edit approvals panel
function EditRequestsPanel() {
  const { currentUser, documents, approveEditRequest } = useApp();
  if (currentUser?.role !== 'director') return null;
  const pending = documents.flatMap(d => (d.editRequests || []).filter(r => r.status === 'pending').map(r => ({ ...r, docId: d.id, docNumber: d.docNumber })));
  if (pending.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-amber-400"/>
        <span className="text-amber-400 text-sm font-medium">Tahrirlash so'rovlari ({pending.length})</span>
      </div>
      {pending.map((req, i) => (
        <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2.5 mb-2">
          <div>
            <span className="text-white text-sm font-medium">{req.name}</span>
            <span className="text-slate-400 text-xs ml-2">{req.docId} ({req.docNumber})</span>
          </div>
          <button onClick={() => approveEditRequest(req.docId, req.userId)}
            className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 transition-all">Ruxsat ber</button>
        </div>
      ))}
    </div>
  );
}

export default function DocumentsPage() {
  const { t, templates, getUserDocuments, updateDocument, addDocument, getDaysOverdue } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [page, setPage] = useState(1);

  const userDocs = getUserDocuments();
  const docs = userDocs.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = d.docNumber?.toLowerCase().includes(s) || d.title?.toLowerCase().includes(s) || d.typeId?.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const pageCount = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));
  const pagedDocs = docs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const currentSelectedDoc = selectedDoc ? userDocs.find(d => d.id === selectedDoc.id) || selectedDoc : null;

  const handleSave = async (updated) => {
    const saved = await updateDocument(updated.id, updated);
    setSelectedDoc(saved);
  };
  const handleAdd = (doc) => addDocument(doc);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-white text-xl font-bold">{t('documents')}</h1>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all shadow-lg shadow-blue-600/25">
          <Plus size={16}/>{t('newDocument')}
        </button>
      </div>

      <EditRequestsPanel/>

      {/* Search & filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 placeholder-slate-500"
            placeholder={t('search')}/>
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
          <option value="all">Barchasi</option>
          <option value="draft">{t('draft')}</option>
          <option value="pending">{t('pending')}</option>
          <option value="signed">{t('signed')}</option>
          <option value="approved">{t('approved')}</option>
        </select>
      </div>

      {/* Doc list */}
      <div className="space-y-2">
        {docs.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30"/>
            <p>{t('noDocuments')}</p>
          </div>
        )}
        {pagedDocs.map(doc => {
          const dt = templates.find(d => d.id === doc.typeId) || DOCUMENT_TYPES.find(d => d.id === doc.typeId);
          const days = getDaysOverdue(doc.deadline);
          const isOverdue = days > 0 && doc.status !== 'approved' && doc.status !== 'signed';

          return (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)}
              className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:border-blue-500/50 hover:bg-slate-800/70
                ${isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-500/20' : 'bg-blue-500/10'}`}>
                <FileText size={18} className={isOverdue ? 'text-red-400' : 'text-blue-400'}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium text-sm">{doc.docNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[doc.status]?.cls}`}>{t(doc.status)}</span>
                  <span className="text-xs text-slate-400 bg-slate-700/50 border border-slate-600/50 px-2 py-0.5 rounded-full">{doc.currency || 'UZS'}</span>
                  {isOverdue && <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={9}/>{days} {t('daysLate')}</span>}
                </div>
                <div className="text-slate-400 text-xs mt-0.5 truncate">{dt?.name || doc.title}</div>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <div className="text-slate-500 text-xs">{doc.createdAt}</div>
                <div className="text-slate-600 text-xs">Muddat: {doc.deadline}</div>
              </div>
              <ChevronRight size={16} className="text-slate-600 flex-shrink-0"/>
            </div>
          );
        })}
      </div>

      {docs.length > PAGE_SIZE && <Pagination page={page} total={docs.length} onPageChange={setPage}/>}

      {currentSelectedDoc && <DocForm doc={currentSelectedDoc} onSave={handleSave} onClose={() => setSelectedDoc(null)}/>}
      {showNew && <NewDocModal onClose={() => setShowNew(false)} onAdd={handleAdd}/>}
    </div>
  );
}
