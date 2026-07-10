import React from 'react';
import { motion } from 'motion/react';

interface QuickAddModalProps {
  isOpen: boolean;
  type: 'type' | 'brand' | 'model';
  title: string;
  placeholder: string;
  value: string;
  onClose: () => void;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen, title, placeholder, value, onClose, onValueChange, onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md glass-modal p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          placeholder={placeholder}
          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none mb-6"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 h-12 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-all">
            Adicionar
          </button>
        </div>
      </motion.div>
    </div>
  );
};