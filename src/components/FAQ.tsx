import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: "هل المنتجات أصلية؟",
    answer: "نعم، نحرص على توفير منتجات أصلية من العلامات التجارية الموثوقة، مع توضيح بيانات المنتج ومصدره عند توفرها."
  },
  {
    question: "كيف أجد المنتج المناسب لنوع بشرتي أو شعري؟",
    answer: "يمكنك استخدام تصنيفات وفلاتر المتجر حسب نوع البشرة، نوع الشعر، نوع المنتج والاحتياجات المختلفة للوصول بسهولة إلى المنتج المناسب لك."
  },
  {
    question: "ما هي مدة ومناطق التوصيل؟",
    answer: "تختلف مدة التوصيل حسب المكان ولكن عادة من 2 يوم الي 4 يوم ، وتظهر تفاصيل ومدة التوصيل أثناء إتمام الطلب."
  },
  {
    question: "ما هي سياسة الاستبدال والاسترجاع؟",
    answer: "يمكنك استبدال أو استرجاع المنتجات خلال 1 يوماً من تاريخ الاستلام، بشرط أن تكون الحالة أصلية ومع التاغ الخاص بها. المنتجات المستخدمة لا يمكن استرجاعها لأسباب صحية."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-surface-container-low" id="faq-section">
      <div className="container mx-auto px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-headline text-5xl font-black uppercase tracking-tighter mb-4">الأسئلة الشائعة</h2>
          <div className="w-20 h-1.5 bg-tertiary mx-auto"></div>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className="border border-black/5 bg-white overflow-hidden rounded-xl shadow-2xs"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-right transition-colors hover:bg-surface-container cursor-pointer"
              >
                <span className="font-headline text-lg font-bold">{faq.question}</span>
                <div className="flex-shrink-0 mr-4">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-tertiary" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-black/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
