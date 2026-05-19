import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, Loader, Sparkles, AlertCircle } from 'lucide-react';

const SYSTEM_PROMPT = (docs, user, lang) => `Sen "${user?.name}" ismli foydalanuvchiga yordam beruvchi AI yordamchisang. Bu korxonaning elektron hujjat aylanishi tizimi (EDMS).
Foydalanuvchi: ${user?.name}, Lavozim: ${user?.position}, Bo'lim: ${user?.department}

Hozirgi hujjatlar holati (${docs.length} ta hujjat):
${docs.map(d => `- ${d.docNumber} (${d.typeId}): Holat="${d.status}", Muddat=${d.deadline}, Yaratilgan=${d.createdAt}`).join('\n')}

Kechikkan hujjatlar: ${docs.filter(d => {
  const today = new Date(); const dl = new Date(d.deadline);
  return today > dl && d.status !== 'approved' && d.status !== 'signed';
}).map(d => d.docNumber).join(', ') || 'Yo\'q'}

Imzolangan hujjatlar: ${docs.filter(d => d.status === 'signed' || d.status === 'approved').length} ta
Kutilayotgan hujjatlar: ${docs.filter(d => d.status === 'pending').length} ta

Til: ${lang === 'uz' ? "O'zbek tilida javob ber" : lang === 'ru' ? 'Отвечай на русском языке' : lang === 'tr' ? 'Türkçe cevap ver' : 'Answer in English'}

Qisqa, aniq va foydali javob ber. Markdown formatlash ishlatma.`;

export default function AIAssistant() {
  const { t, getUserDocuments, currentUser, lang } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: lang === 'uz' ? "Salom! Men sizning EDMS tizimingiz bo'yicha yordamchiman. Hujjatlar holati, kechikishlar yoki boshqa savollar bo'yicha yordam bera olaman." : "Hello! I'm your EDMS assistant. I can help with document status, deadlines, and more." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const docs = getUserDocuments();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const QUICK_QUESTIONS = [
    lang === 'uz' ? 'Kechikkan hujjatlar bormi?' : lang === 'ru' ? 'Есть ли просроченные документы?' : lang === 'tr' ? 'Gecikmiş belge var mı?' : 'Any overdue documents?',
    lang === 'uz' ? 'Imzo kutayotgan hujjatlar?' : lang === 'ru' ? 'Документы ожидающие подписи?' : lang === 'tr' ? 'İmza bekleyen belgeler?' : 'Documents awaiting signature?',
    lang === 'uz' ? 'Umumiy statistika?' : lang === 'ru' ? 'Общая статистика?' : lang === 'tr' ? 'Genel istatistik?' : 'Overall statistics?',
  ];

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setError('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT(docs, currentUser, lang),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const aiText = data.content?.[0]?.text || 'Javob olishda xatolik';
      setMessages([...newMessages, { role: 'assistant', content: aiText }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles size={17} className="text-white"/>
        </div>
        <div>
          <div className="text-white font-bold text-sm">{t('aiAssistant')}</div>
          <div className="text-slate-400 text-xs">Powered by Claude AI</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              ${msg.role === 'assistant' ? 'bg-gradient-to-br from-blue-500 to-violet-500' : 'bg-slate-600'}`}>
              {msg.role === 'assistant' ? <Bot size={15} className="text-white"/> : <User size={15} className="text-white"/>}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
              ${msg.role === 'assistant' ? 'bg-slate-800 border border-slate-700/50 text-slate-200' : 'bg-blue-600 text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-white"/>
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader size={14} className="text-blue-400 animate-spin"/>
              <span className="text-slate-400 text-sm">Javob tayyorlanmoqda...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={14}/>{error}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-700/50 flex-shrink-0">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 placeholder-slate-500 disabled:opacity-60"
            placeholder={t('aiPlaceholder')}/>
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 flex-shrink-0">
            <Send size={16} className="text-white"/>
          </button>
        </div>
      </div>
    </div>
  );
}
