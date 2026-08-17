import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: "Sportswear Powered",
    subtitle: "By Tech",
    description: "A signature fresh scent inside the fabric. Activated by motion.",
    image: "/hero-blueline.svg",
    accent: "Scent-Release Technology ™"
  },
  {
    id: 2,
    title: "Elite Performance",
    subtitle: "Without Limits",
    description: "Engineered for the modern athlete. Precision and power in every fiber.",
    image: "/hero-bodymists.svg",
    accent: "Elite Series"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-80" 
              src={SLIDES[currentSlide].image}
              alt={SLIDES[currentSlide].title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20"></div>
          </div>

          {/* Kinetic Background Text */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 font-headline text-[25vw] text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
            TAMMI
          </div>
          
          <div className="container mx-auto px-6 md:px-8 h-full relative z-10 flex flex-col items-center md:items-start justify-center text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl flex flex-col items-center md:items-start"
            >
              <h1 className="font-headline text-[2.8rem] sm:text-[3.5rem] md:text-[6.5rem] font-black text-white leading-[0.95] tracking-tighter mb-4">
                {SLIDES[currentSlide].title}<br/>
                <span className="text-red-600">{SLIDES[currentSlide].subtitle}</span>
              </h1>
              <span className="text-white font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px] mb-8 block">
                {SLIDES[currentSlide].accent}
              </span>
              <p className="text-white font-sans text-base md:text-2xl mb-10 max-w-2xl leading-snug">
                {SLIDES[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full">
                <button 
                  onClick={() => {
                    const el = document.getElementById('shop-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-black px-12 py-4 transition-all duration-300 rounded-full text-xs uppercase tracking-widest shadow-xl cursor-pointer active:scale-95"
                >
                  Shop Now
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 1 : -1);
                setCurrentSlide(i);
              }}
              className={`w-3 h-3 transition-all ${i === currentSlide ? 'bg-tertiary w-8' : 'bg-white/30'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
