import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl flex-shrink-0",
                type === 'danger' && "bg-rose-500/10 text-rose-500",
                type === 'warning' && "bg-amber-500/10 text-amber-500",
                type === 'info' && "bg-blue-500/10 text-blue-500"
              )}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white/5 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-lg",
                type === 'danger' && "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",
                type === 'warning' && "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
                type === 'info' && "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
