import React from 'react';
import { CheckCircle2, BookmarkCheck } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#241E1A] text-[#FAF7F2] border border-[#8C3B24]/40 px-4 py-3 rounded-xs shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
      <BookmarkCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};
