import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Mantém o aplicativo em uma versão conhecida. O service worker nunca é
 * atualizado silenciosamente durante uma operação; a pessoa recebe uma ação
 * explícita e a nova versão assume imediatamente quando ela confirma.
 */
export function PwaUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateServiceWorker = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onRegisterError(error) {
        console.error('Não foi possível registrar a atualização do aplicativo.', error);
      },
    });

    updateServiceWorker.current = () => update(true);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-[10000] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-primary/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur">
      <RefreshCw className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">Uma nova versão do INOVA PRO está pronta.</p>
      <button
        type="button"
        onClick={() => void updateServiceWorker.current?.()}
        className="rounded-xl bg-primary px-3 py-2 text-sm font-bold transition hover:bg-primary/90"
      >
        Atualizar agora
      </button>
    </div>
  );
}
