import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from '../modals/FeedbackModal';

export const FeedbackBubble: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-[9990] w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 group"
        title="Enviar Feedback ou Relatar Erro"
      >
        <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
