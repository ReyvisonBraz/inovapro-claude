import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Wallet, Briefcase, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';
import { useFormStore } from '../../../store/useFormStore';

interface CustomerSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number | null;
  source?: 'customers' | 'service-orders' | 'payments' | null;
}

export const CustomerSuccessModal: React.FC<CustomerSuccessModalProps> = ({
  isOpen,
  onClose,
  customerId,
  source
}) => {
  const navigate = useNavigate();
  const { setIsAddingClientPayment, setIsAddingServiceOrder, setActiveScreen } = useAppStore();
  const { setNewClientPayment, setNewServiceOrder } = useFormStore();

  if (!isOpen || !customerId) return null;

  const handleCreatePayment = () => {
    setNewClientPayment({
      customerId: customerId,
      description: '',
      totalAmount: '',
      paidAmount: '',
      paymentMethod: 'pix',
      purchaseDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      installmentsCount: 1,
      installmentInterval: 'monthly'
    });
    setActiveScreen('client-payments');
    navigate('/vendas');
    setIsAddingClientPayment(true);
    onClose();
  };

  const handleCreateServiceOrder = () => {
    setNewServiceOrder({
      customerId: customerId,
      equipmentType: '',
      equipmentBrand: '',
      equipmentModel: '',
      reportedProblem: '',
      accessories: '',
      observation: '',
      status: 'Orçamento',
      priority: 'medium',
      entryDate: new Date().toISOString().split('T')[0],
      analysisPrediction: '',
      totalAmount: 0,
      items: []
    });
    setActiveScreen('service-orders');
    navigate('/ordens');
    setIsAddingServiceOrder(true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-modal p-6 shadow-2xl border-white/10 flex flex-col items-center text-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>

          <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Cliente Cadastrado!</h3>
          <p className="text-sm text-slate-400 mb-8">
            O cliente foi salvo com sucesso. O que você deseja fazer agora?
          </p>

          <div className={`grid gap-3 w-full ${source === 'payments' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <button
              onClick={handleCreatePayment}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet size={20} className="text-primary" />
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Lançar Pagamento</span>
            </button>

            {source !== 'payments' && (
              <button
                onClick={handleCreateServiceOrder}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase size={20} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Criar Ordem de Serviço</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Agora não, fechar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
