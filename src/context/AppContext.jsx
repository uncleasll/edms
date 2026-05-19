import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations } from '../data/translations';
import { apiFetch, downloadUrl, getAccessToken, setAccessToken } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('uz');
  const [currentUser, setCurrentUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [initializing, setInitializing] = useState(Boolean(getAccessToken()));
  const [apiError, setApiError] = useState('');

  const t = useCallback((key) => translations[lang]?.[key] || key, [lang]);

  const refreshDocuments = useCallback(async () => {
    const data = await apiFetch('/documents');
    setDocuments(data);
    return data;
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await apiFetch('/notifications');
    setNotifications(data);
    return data;
  }, []);

  const loadSessionData = useCallback(async () => {
    const [me, docs, notes, appUsers, appTemplates] = await Promise.all([
      apiFetch('/auth/me'),
      apiFetch('/documents'),
      apiFetch('/notifications'),
      apiFetch('/users'),
      apiFetch('/templates'),
    ]);
    setCurrentUser(me);
    setDocuments(docs);
    setNotifications(notes);
    setUsers(appUsers);
    setTemplates(appTemplates);
  }, []);

  useEffect(() => {
    if (!getAccessToken()) return;
    loadSessionData()
      .catch(() => {
        setAccessToken('');
        setCurrentUser(null);
      })
      .finally(() => setInitializing(false));
  }, [loadSessionData]);

  const login = async (username, password) => {
    setApiError('');
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAccessToken(data.access_token);
    setCurrentUser(data.user);
    await loadSessionData();
    return true;
  };

  const logout = () => {
    setAccessToken('');
    setCurrentUser(null);
    setDocuments([]);
    setNotifications([]);
    setUsers([]);
    setTemplates([]);
  };

  const getDaysOverdue = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return Math.floor((today - dl) / 86400000);
  };

  const canEditDocument = (doc) => {
    if (!currentUser || !doc) return false;
    if (currentUser.role === 'director') return true;
    if (doc.status === 'signed' || doc.status === 'approved') {
      return doc.editApproved && doc.editApproved === currentUser.id;
    }
    return doc.createdBy === currentUser.id;
  };

  const replaceDocument = (updated) => {
    setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
    return updated;
  };

  const updateDocument = async (id, updates) => {
    const updated = await apiFetch(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, language: updates.language || lang }),
    });
    return replaceDocument(updated);
  };

  const addDocument = async (doc) => {
    const created = await apiFetch('/documents', {
      method: 'POST',
      body: JSON.stringify({ ...doc, language: doc.language || lang }),
    });
    setDocuments(prev => [created, ...prev]);
    await refreshNotifications();
    return created.id;
  };

  const signDocument = async (docId) => {
    const updated = await apiFetch(`/documents/${docId}/sign`, { method: 'POST' });
    await refreshNotifications();
    return replaceDocument(updated);
  };

  const requestEdit = async (docId) => {
    const updated = await apiFetch(`/documents/${docId}/request-edit`, { method: 'POST' });
    await refreshNotifications();
    return replaceDocument(updated);
  };

  const approveEditRequest = async (docId, userId) => {
    const updated = await apiFetch(`/documents/${docId}/approve-edit/${userId}`, { method: 'POST' });
    await refreshNotifications();
    return replaceDocument(updated);
  };

  const uploadAttachment = async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const updated = await apiFetch(`/documents/${docId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    await refreshNotifications();
    return replaceDocument(updated);
  };

  const importDocumentExcel = async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const updated = await apiFetch(`/documents/${docId}/import.xlsx`, {
      method: 'POST',
      body: formData,
    });
    return replaceDocument(updated);
  };

  const openAuthenticatedDownload = async (path, filename) => {
    const response = await fetch(downloadUrl(path), {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    if (!response.ok) throw new Error(response.statusText);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadDocument = (docId) => openAuthenticatedDownload(`/documents/${docId}/download?lang=${encodeURIComponent(lang)}`, `${docId}.json`);
  const downloadDocumentExcel = (docId) => openAuthenticatedDownload(`/documents/${docId}/export.xlsx?lang=${encodeURIComponent(lang)}`, `${docId}.xlsx`);
  const downloadAttachment = (attachment) => openAuthenticatedDownload(`/attachments/${attachment.id}/download`, attachment.originalName);

  const refreshUsers = async () => {
    const data = await apiFetch('/users');
    setUsers(data);
    return data;
  };

  const saveUser = async (payload) => {
    const isEdit = Boolean(payload.id);
    const saved = await apiFetch(isEdit ? `/users/${payload.id}` : '/users', {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    setUsers(prev => isEdit ? prev.map(u => u.id === saved.id ? saved : u) : [...prev, saved]);
    return saved;
  };

  const deleteUser = async (id) => {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.map(user => user.id === id ? { ...user, active: false } : user));
  };

  const refreshTemplates = async () => {
    const data = await apiFetch('/templates');
    setTemplates(data);
    return data;
  };

  const saveTemplate = async (payload) => {
    const isEdit = Boolean(payload.id);
    const saved = await apiFetch(isEdit ? `/templates/${payload.id}` : '/templates', {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    setTemplates(prev => isEdit ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved]);
    return saved;
  };

  const getAuditLogs = () => apiFetch('/audit-logs');

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{ id: Date.now(), message, type, read: false, time: new Date().toISOString() }, ...prev]);
  };

  const markNotificationsRead = async () => {
    await apiFetch('/notifications/read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getUserDocuments = () => documents;

  const value = {
    lang, setLang, t, currentUser, initializing, apiError, setApiError, login, logout,
    documents, updateDocument, addDocument, signDocument,
    requestEdit, approveEditRequest, uploadAttachment, importDocumentExcel, downloadDocument, downloadDocumentExcel, downloadAttachment,
    notifications, markNotificationsRead, addNotification,
    getDaysOverdue, canEditDocument, getUserDocuments,
    users, templates, refreshUsers, saveUser, deleteUser, refreshTemplates, saveTemplate, getAuditLogs, refreshDocuments, refreshNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
