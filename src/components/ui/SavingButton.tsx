import { Loader2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SavingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSaving: boolean;
  saved?: boolean;
  children: React.ReactNode;
}

export function SavingButton({
  isSaving,
  saved = false,
  children,
  className,
  disabled,
  ...props
}: SavingButtonProps) {
  return (
    <button
      className={cn('inline-flex items-center gap-2 transition-colors', className)}
      disabled={isSaving || disabled}
      {...props}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : saved ? (
        <>
          <Check className="h-4 w-4" />
          Salvo
        </>
      ) : (
        children
      )}
    </button>
  );
}
