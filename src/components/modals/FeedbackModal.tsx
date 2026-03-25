import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Camera, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useToast } from '../ui/Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'suggestion' | 'other';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useAppSettings();
  const { showToast } = useToast();
  
  const [type, setType] = useState<FeedbackType>('bug');
  const [description, setDescription] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      showToast('Por favor, descreva o que você encontrou.', 'warning');
      return;
    }

    if (!settings.telegramBotToken || !settings.telegramChatId) {
      showToast('Configurações do Telegram não preenchidas no painel.', 'error');
      return;
    }

    setIsSubmitting(true);
    let screenshotBase64 = '';

    try {
      if (includeScreenshot) {
        // Hide modal temporarily for screenshot
        if (modalRef.current) {
          modalRef.current.style.opacity = '0';
        }

        // Add a small delay for UI to paint
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(document.body, {
          useCORS: true,
          logging: false,
          ignoreElements: (element) => (element as HTMLElement).dataset?.html2canvasIgnore === 'true'
        });
        
        screenshotBase64 = canvas.toDataURL('image/jpeg', 0.6);

        if (modalRef.current) {
          modalRef.current.style.opacity = '1';
        }
      }

      const caption = `
🛠️ *Novo Feedback Recebido*
*Tipo:* ${type === 'bug' ? '🐛 Bug/Erro' : type === 'suggestion' ? '💡 Sugestão' : '💬 Outro'}
*URL:* ${window.location.href}
*Data:* ${new Date().toLocaleString('pt-BR')}

*Descrição:*
${description}
      `.trim();

      if (includeScreenshot && screenshotBase64) {
        // Convert Base64 to Blob
        const fetchResponse = await fetch(screenshotBase64);
        const blob = await fetchResponse.blob();

        const formData = new FormData();
        formData.append('chat_id', settings.telegramChatId);
        formData.append('photo', blob, 'screenshot.jpg');
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');

        const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.description || 'Falha ao enviar foto para Telegram');
        }
      } else {
        const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: caption,
            parse_mode: 'Markdown'
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.description || 'Falha ao enviar mensagem para Telegram');
        }
      }

      showToast('Feedback enviado com sucesso! Obrigado!', 'success');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      showToast(`Erro Telegram: ${error.message || 'Falha na conexão'}`, 'error');
    } finally {
      setIsSubmitting(false);
      // Ensure modal visibility is restored just in case it failed during screenshot
      if (modalRef.current) {
        modalRef.current.style.opacity = '1';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col transition-opacity duration-200"
          data-html2canvas-ignore="true"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Feedback do Sistema</h3>
              <p className="text-xs text-slate-400">Ajude-nos a melhorar relatando bugs ou sugerindo melhorias.</p>
            </div>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Tipo de Feedback */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Qual o tipo de retorno?</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    type === 'bug' 
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Bug className="w-5 h-5" />
                  <span className="text-xs font-bold">Relatar Bug</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    type === 'suggestion' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-xs font-bold">Sugestão</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('other')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    type === 'other' 
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-bold">Dúvida / Outro</span>
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição detalhada</label>
              <div className="relative">
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Por favor, explique o que você encontrou..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-slate-200"
                />
              </div>
            </div>

            {/* Inclusão de Captura */}
            <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer group hover:bg-white/10 transition-colors">
              <input 
                type="checkbox"
                checked={includeScreenshot}
                onChange={(e) => setIncludeScreenshot(e.target.checked)}
                className="w-5 h-5 rounded-md bg-white/5 border border-white/10 text-primary focus:ring-primary outline-none"
              />
              <div className="flex items-center gap-3 text-sm">
                <div className={`p-2 rounded-lg transition-colors ${includeScreenshot ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-400'}`}>
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Anexar captura de tela</div>
                  <div className="text-xs text-slate-400">O sistema tirará um print da página atual automaticamente para auxiliar na análise.</div>
                </div>
              </div>
            </label>
            
            {(!settings.telegramBotToken || !settings.telegramChatId) && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs text-center flex items-center justify-center gap-2">
                As chaves do Telegram não estão preenchidas nas configurações. O envio não funcionará.
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Feedback
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
