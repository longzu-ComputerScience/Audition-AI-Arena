import React from 'react';
import { X, Sparkles, Compass } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#181412]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FFFDF9] border border-[#D5C7B4] rounded-sm max-w-xl w-full p-6 sm:p-8 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 text-[#7A6A5C] hover:text-[#241E1A] hover:bg-[#F2EBE0] rounded-xs transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#EFE8DC] pb-4 mb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C3B24]">
            <Compass className="w-3.5 h-3.5" />
            <span>Tuyên Ngôn Thiết Kế</span>
          </div>
          <h2 className="text-2xl font-editorial font-bold text-[#241E1A] mt-1">
            Triết Lý "Tiếp Biến Văn Hóa"
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#4E433C] leading-relaxed">
          <p>
            <strong>Việt Phục Remix</strong> ra đời với một câu hỏi cốt lõi: <em>Làm thế nào để cổ phục không chỉ nằm trong bảo tàng hay dịp lễ hội, mà bước thẳng vào đời sống thường nhật của giới trẻ hôm nay?</em>
          </p>
          <p>
            Chúng tôi tin rằng bảo tồn di sản không đồng nghĩa với việc đóng băng nó trong quá khứ. Bằng cách giữ nguyên cấu trúc trụ cột (cổ đứng lập lĩnh, khuy cài ngũ thường, đường lượn tà áo) và táo bạo kết hợp với raw denim, chunky loafer, túi techwear hay sneaker năng động, chiếc áo Việt tìm lại được nhịp đập đương đại.
          </p>
          <blockquote className="p-3.5 bg-[#FAF7F2] border-l-2 border-[#8C3B24] rounded-r-xs italic font-serif text-[#241E1A]">
            "Di sản không phải là đống tro tàn cần thờ phụng, mà là ngọn lửa cần được tiếp nối và bùng cháy rực rỡ hơn."
          </blockquote>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFE8DC] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 bg-[#241E1A] hover:bg-[#8C3B24] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
