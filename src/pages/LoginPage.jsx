import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const LANG_OPTIONS = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LoginPage() {
  const { login, t, lang, setLang } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch {
      setError(lang === 'uz' ? 'Login yoki parol noto\'g\'ri' : lang === 'ru' ? 'Неверный логин или пароль' : lang === 'tr' ? 'Hatalı kullanıcı adı veya şifre' : 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Lang switcher */}
        <div className="flex justify-center gap-2 mb-6">
          {LANG_OPTIONS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${lang === l.code ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 shadow-lg">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="2" width="18" height="24" rx="2" fill="white" opacity="0.9"/>
                <rect x="8" y="7" width="10" height="1.5" rx="0.75" fill="#2563eb"/>
                <rect x="8" y="11" width="10" height="1.5" rx="0.75" fill="#2563eb"/>
                <rect x="8" y="15" width="7" height="1.5" rx="0.75" fill="#2563eb"/>
                <circle cx="23" cy="22" r="7" fill="#1d4ed8"/>
                <path d="M20 22l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold tracking-wide">{t('appName')}</h1>
            <p className="text-blue-200 text-xs mt-1 font-medium">{t('appSubtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">{t('username')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                  placeholder={t('username')} required />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl px-4 py-2 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>{t('loginBtn')}</span> : t('loginBtn')}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="px-8 pb-6">
            <p className="text-white/40 text-xs text-center mb-3">Demo login / Demо / Demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[['direktor', 'Direktor'], ['ombor1', 'Ombor 1'], ['ombor2', 'Ombor 2'], ['ishlab1', 'Ishlab 1']].map(([u, label]) => (
                <button key={u} onClick={() => { setUsername(u); setPassword('1234'); }}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg py-1.5 px-2 transition-all text-left">
                  {label}: <span className="text-white/40">{u}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
