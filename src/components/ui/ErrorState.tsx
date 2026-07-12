import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message = 'Algo deu errado.', onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className
      )}
    >
      <AlertTriangle className="h-10 w-10 text-rose-400" />
      <p className="text-sm font-medium text-rose-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
