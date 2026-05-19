import { useApp } from '../context/AppContext';
import { Globe, User, Shield, ExternalLink } from 'lucide-react';

const LANGS = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿', native: "O'zbek" },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', native: 'Русский' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', native: 'Türk' },
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
];

export default function SettingsPage() {
  const { t, lang, setLang, currentUser } = useApp();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-white text-xl font-bold">{t('settings')}</h1>

      {currentUser?.role === 'director' && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-white font-semibold text-sm">Admin panel</div>
            <div className="text-slate-400 text-xs mt-1">Hodimlar, hujjat shakllari va audit boshqaruvi alohida panelda.</div>
          </div>
          <button onClick={() => { window.location.href = '/admin'; }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium">
            <ExternalLink size={15}/> Ochish
          </button>
        </div>
      )}

      {/* Profile */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <User size={16} className="text-blue-400"/><h3 className="text-white font-semibold text-sm">{t('profile')}</h3>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">{currentUser?.avatar}</div>
          <div>
            <div className="text-white font-bold">{currentUser?.name}</div>
            <div className="text-slate-400 text-sm">{currentUser?.position}</div>
            <div className="text-slate-500 text-xs mt-0.5">{currentUser?.department}</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">{currentUser?.role}</span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={16} className="text-green-400"/><h3 className="text-white font-semibold text-sm">{t('language')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                ${lang === l.code ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'}`}>
              <span className="text-2xl">{l.flag}</span>
              <div>
                <div className="text-white text-sm font-medium">{l.native}</div>
                <div className="text-slate-400 text-xs">{l.label}</div>
              </div>
              {lang === l.code && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400"/>}
            </button>
          ))}
        </div>
      </div>

      {/* Access info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={16} className="text-amber-400"/><h3 className="text-white font-semibold text-sm">Ruxsat darajasi</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[
            ['Bo\'limlarga kirish', currentUser?.department],
            ['Hujjat yaratish', 'Ruxsat berilgan'],
            ['Imzo qo\'yish', currentUser?.role === 'director' ? 'Tasdiqlash huquqi' : 'Oddiy imzo'],
            ['Tahrirlash', currentUser?.role === 'director' ? 'Barcha hujjatlar' : 'Faqat o\'z hujjatlari'],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
              <span className="text-slate-400">{key}</span>
              <span className="text-white font-medium text-xs">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
