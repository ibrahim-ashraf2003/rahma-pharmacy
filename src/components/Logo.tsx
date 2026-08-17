import { motion, AnimatePresence } from 'motion/react';
import PharmacyEmblem from './PharmacySymbol';

export default function Logo({
  className = "h-10 w-auto",
  scrolled = false,
  showText = true,
}: {
  className?: string;
  scrolled?: boolean;
  showText?: boolean;
}) {
  return (
    <div className={`${className} flex items-center gap-3 overflow-visible cursor-pointer select-none`} dir="ltr">
      {/* Pharmacy Emblem Icon with Motion Hover / Scale effect */}
      <motion.div
        className="relative z-10 h-full aspect-square flex items-center justify-center shrink-0"
        animate={{
          scale: scrolled ? 0.95 : 1,
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Glow / Halo Effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-sm -z-10" />

        <PharmacyEmblem className="h-full w-full object-contain block relative z-10 drop-shadow-sm" />
      </motion.div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center overflow-visible whitespace-nowrap text-right" dir="rtl">
          <span className="font-headline text-xl md:text-2xl font-black text-gray-900 tracking-normal">
            صيدلية الرحمة
          </span>
        </div>
      )}
    </div>
  );
}
