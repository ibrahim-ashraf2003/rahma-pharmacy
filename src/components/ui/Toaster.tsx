import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToasts, toast } from '../../lib/toast';

export default function Toaster() {
  const toasts = useToasts();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 pointer-events-none space-y-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto bg-white border border-black/5 shadow-2xl rounded-2xl p-4 flex items-center gap-4 ${
              t.type === 'error' ? 'border-red-100' : 'border-[#e8ff3c]/20'
            }`}
          >
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              t.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-[#e8ff3c]/10 text-black'
            }`}>
              {t.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            
            <p className="flex-1 text-sm font-bold leading-tight">
              {t.message}
            </p>

            <button 
              onClick={() => toast.remove(t.id)}
              className="p-1 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
