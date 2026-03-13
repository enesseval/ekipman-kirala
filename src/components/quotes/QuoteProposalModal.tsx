'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Sparkles, Send, Printer, Save, Check, Loader2, MessageSquare, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { QuoteLineItem } from '@/lib/types';

interface QuoteData {
  clientName: string;
  eventName: string;
  clientEmail?: string;
  clientPhone?: string;
  lineItems: QuoteLineItem[];
  subtotalKurus: number;
  discountPercent: number;
  discountAmountKurus: number;
  taxAmountKurus: number;
  totalKurus: number;
  quoteNumber: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuoteProposalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string, isAI: boolean) => Promise<void>;
  initialText: string;
  quoteData: QuoteData;
}

const QUICK_PROMPTS = [
  'Daha resmi yaz',
  'Metni kısalt',
  'Daha samimi ton',
  'Teknik detayları artır',
  'Fiyatları öne çıkar',
];

export default function QuoteProposalModal({
  open,
  onClose,
  onSave,
  initialText,
  quoteData,
}: QuoteProposalModalProps) {
  const [proposalText, setProposalText] = useState(initialText);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Teklif metni hazır! İstediğiniz değişiklikler için mesaj yazabilirsiniz. Örneğin: "Daha resmi yap" veya "Teknik detayları artır".',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    setProposalText(initialText);
  }, [initialText]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, refining]);

  const handleRefine = useCallback(
    async (instruction: string) => {
      if (!instruction.trim() || refining) return;

      setRefining(true);
      setChatMessages((prev) => [...prev, { role: 'user', content: instruction }]);
      setChatInput('');

      try {
        const res = await fetch('/api/refine-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentText: proposalText, instruction }),
        });
        const data = await res.json();
        if (data.text) {
          setProposalText(data.text);
          setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Metin güncellendi. Başka bir değişiklik ister misiniz?' },
          ]);
        } else if (data.error) {
          setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `Hata: ${data.error}` },
          ]);
        }
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
        ]);
      } finally {
        setRefining(false);
      }
    },
    [proposalText, refining]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async (isAI: boolean) => {
    setSaving(true);
    try {
      await onSave(proposalText, isAI);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-5xl h-[88vh] bg-stone-900 border border-stone-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} className="text-violet-400" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-stone-100 text-sm">
                  AI ile Oluşturulan Teklif
                </h2>
                <p className="text-xs text-stone-500">
                  {quoteData.quoteNumber} · {quoteData.clientName || quoteData.eventName || 'Müşteri'}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium hidden sm:inline">
                Gemini 1.5 Flash
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-all flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">

            {/* Left: Editable proposal text */}
            <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-stone-800">
              <div className="px-4 py-2.5 border-b border-stone-800/60 flex items-center gap-2 flex-shrink-0">
                <FileText size={13} className="text-stone-500" />
                <span className="text-xs font-medium text-stone-400">Teklif Metni</span>
                <span className="text-[10px] text-stone-600 ml-auto">Düzenleyebilirsiniz</span>
              </div>
              <textarea
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                className="flex-1 resize-none bg-transparent p-4 text-sm text-stone-300 leading-relaxed focus:outline-none placeholder-stone-700 font-sans"
                placeholder="Teklif metni burada görünecek. Sol üstteki 'AI ile Teklif Oluştur' butonuna tıklayarak AI'ın sizin için metin oluşturmasını sağlayabilir ya da buraya manuel yazabilirsiniz."
              />
            </div>

            {/* Right: AI chat */}
            <div className="w-full lg:w-80 flex flex-col min-h-0 h-56 lg:h-auto flex-shrink-0">
              <div className="px-4 py-2.5 border-b border-stone-800/60 flex items-center gap-2 flex-shrink-0">
                <MessageSquare size={13} className="text-stone-500" />
                <span className="text-xs font-medium text-stone-400">AI Asistan</span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-xs rounded-lg p-2.5',
                      msg.role === 'user'
                        ? 'bg-violet-500/10 text-violet-200 border border-violet-500/20 ml-4'
                        : 'bg-stone-800 text-stone-300'
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {refining && (
                  <div className="bg-stone-800 rounded-lg p-2.5 flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin text-violet-400" />
                    <span className="text-xs text-stone-400">Metin güncelleniyor...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick prompt chips */}
              <div className="px-3 pb-2 flex-shrink-0">
                <div className="flex flex-wrap gap-1 mb-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleRefine(p)}
                      disabled={refining}
                      className="text-[10px] px-2 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700 hover:border-violet-500/40 hover:text-violet-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat input */}
              <div className="px-3 pb-3 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine(chatInput)}
                    placeholder="Talimat yaz..."
                    disabled={refining}
                    className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={() => handleRefine(chatInput)}
                    disabled={refining || !chatInput.trim()}
                    className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-stone-800 flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button onClick={onClose} className="btn-secondary text-xs px-3 py-2">
              Vazgeç
            </button>
            <div className="flex-1" />
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-all"
            >
              <Printer size={13} />
              PDF İndir
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving || saved}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                saved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 disabled:opacity-50'
              )}
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              {saved ? 'Kaydedildi' : 'Taslak Kaydet'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || saved}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Teklifi Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Print template — hidden normally, visible only during window.print() */}
      <div id="proposal-print-root" aria-hidden="true">
        <div className="proposal-print-page">
          {/* BrewOps Header */}
          <div className="proposal-header">
            <div>
              <h1>BrewOps</h1>
              <p>Premium Ekipman Kiralama · Teknik Destek · Barista Hizmetleri</p>
            </div>
            <div className="proposal-meta">
              <p><strong>{quoteData.quoteNumber}</strong></p>
              <p>Tarih: {formatDate(today)}</p>
              <p>Geçerlilik: {formatDate(validUntil)}</p>
            </div>
          </div>

          {/* Client info */}
          <div className="proposal-client">
            <p className="proposal-label">SAYIN</p>
            <p className="proposal-client-name">{quoteData.clientName || quoteData.eventName || '—'}</p>
            {quoteData.eventName && quoteData.clientName && (
              <p>{quoteData.eventName}</p>
            )}
            {quoteData.clientEmail && <p>{quoteData.clientEmail}</p>}
            {quoteData.clientPhone && <p>{quoteData.clientPhone}</p>}
          </div>

          {/* AI proposal text */}
          <div className="proposal-body">
            {proposalText
              ? proposalText.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i}>{line}</p>
                ))
              : <p>Teklif metni girilmedi.</p>
            }
          </div>

          {/* Equipment table */}
          <div className="proposal-table-section">
            <p className="proposal-label">EKİPMAN VE FİYAT LİSTESİ</p>
            <table className="proposal-table">
              <thead>
                <tr>
                  <th>Ekipman</th>
                  <th>Tür</th>
                  <th>Gün</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.equipmentName}</td>
                    <td>{item.equipmentType === 'espresso_machine' ? 'Espresso Makinesi' : 'Kahve Öğütücü'}</td>
                    <td>{item.days}</td>
                    <td>{formatCurrency(item.dailyRate)}/gün</td>
                    <td><strong>{formatCurrency(item.subtotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="proposal-totals">
              <div className="proposal-total-row">
                <span>Ara Toplam</span>
                <span>{formatCurrency(quoteData.subtotalKurus)}</span>
              </div>
              {quoteData.discountPercent > 0 && (
                <div className="proposal-total-row">
                  <span>İndirim (%{quoteData.discountPercent})</span>
                  <span>-{formatCurrency(quoteData.discountAmountKurus)}</span>
                </div>
              )}
              <div className="proposal-total-row">
                <span>KDV (%20)</span>
                <span>{formatCurrency(quoteData.taxAmountKurus)}</span>
              </div>
              <div className="proposal-total-row proposal-grand-total">
                <span>GENEL TOPLAM</span>
                <span>{formatCurrency(quoteData.totalKurus)}</span>
              </div>
            </div>
          </div>

          {/* Signature area */}
          <div className="proposal-signature">
            <div className="proposal-sig-box">
              <p className="proposal-label">MÜŞTERİ İMZASI</p>
              <div className="proposal-sig-line" />
              <p>{quoteData.clientName || '—'}</p>
            </div>
            <div className="proposal-sig-box">
              <p className="proposal-label">BREWOPS YETKİLİ</p>
              <div className="proposal-sig-line" />
              <p>BrewOps Ekipman Kiralama</p>
            </div>
          </div>

          {/* Footer */}
          <div className="proposal-footer">
            <p>BrewOps Ekipman Kiralama — Bu teklif {formatDate(validUntil)} tarihine kadar geçerlidir.</p>
            <p>info@brewops.com · +90 (212) 555 01 01 · www.brewops.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
