import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType } from '../hooks/useToast';

const iconMap = {
  success: <CheckCircle className="w-4 h-4 text-[#10b981]" />,
  error: <AlertCircle className="w-4 h-4 text-[#ef4444]" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />,
  info: <Info className="w-4 h-4 text-[#3b82f6]" />,
};

const bgMap = {
  success: 'bg-[#10b981]/10 border-[#10b981]/20',
  error: 'bg-[#ef4444]/10 border-[#ef4444]/20',
  warning: 'bg-[#f59e0b]/10 border-[#f59e0b]/20',
  info: 'bg-[#3b82f6]/10 border-[#3b82f6]/20',
};

interface ToastProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border ${bgMap[toast.type]} backdrop-blur-sm min-w-[280px] max-w-[400px]`}
          >
            {iconMap[toast.type]}
            <p className="text-xs text-[#d4d4d4] flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#737373] hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
