import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Truck, Phone, Store, Flame, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import HeaderSearch from './HeaderSearch';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen, setView } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      setView('shop');
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'الرئيسية', action: () => { navigate('/'); setView('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { name: 'الأكثر مبيعاً', action: () => scrollToSection('bestsellers-section') },
    { name: 'المتجر والمنتجات', action: () => scrollToSection('shop-section') },
    { name: 'العناية بالشعر', action: () => { navigate('/?category=العناية بالشعر'); scrollToSection('shop-section'); } },
    { name: 'العناية بالبشرة', action: () => { navigate('/?category=العناية بالبشرة'); scrollToSection('shop-section'); } },
    { name: 'واقي الشمس', action: () => { navigate('/?category=واقي الشمس'); scrollToSection('shop-section'); } },
    { name: 'الأسئلة الشائعة', action: () => scrollToSection('faq-section') },
  ];

  const singleSet = [
    {
      id: 'shipping',
      icon: <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
      text: "شحن سريع لجميع محافظات مصر - شحن مجاني للطلبات الكبيرة",
    },
    {
      id: 'support',
      icon: <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
      text: "خدمة العملاء والطلبات عبر واتساب والهاتف:",
      phone: "01094349118",
    },
  ];

  const trackItems = [
    ...singleSet,
    ...singleSet,
    ...singleSet,
    ...singleSet,
  ];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="w-full sticky top-0 z-[60]"
      dir="rtl"
    >
      {/* Top Infinite Scrolling Announcement Bar */}
      <div 
        className="w-full bg-gray-950 text-white py-2 overflow-hidden select-none border-b border-white/10 relative z-50 shadow-md flex"
        dir="ltr"
      >
        <div className="flex w-max animate-infinite-marquee">
          {/* Track 1 */}
          <div className="flex items-center gap-8 sm:gap-12 px-4 shrink-0 whitespace-nowrap text-xs md:text-[13px] font-bold">
            {trackItems.map((item, idx) => (
              <div key={`track1-${idx}`} className="flex items-center gap-2" dir="rtl">
                {item.icon}
                <span className="text-gray-100">{item.text}</span>
                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center bg-white/20 hover:bg-white/35 text-white font-black px-2 py-0.5 rounded transition-colors tracking-wider mr-1 text-xs"
                    dir="ltr"
                  >
                    {item.phone}
                  </a>
                )}
                <span className="text-emerald-400 mr-4 sm:mr-6 text-xs">✦</span>
              </div>
            ))}
          </div>

          {/* Track 2 */}
          <div className="flex items-center gap-8 sm:gap-12 px-4 shrink-0 whitespace-nowrap text-xs md:text-[13px] font-bold" aria-hidden="true">
            {trackItems.map((item, idx) => (
              <div key={`track2-${idx}`} className="flex items-center gap-2" dir="rtl">
                {item.icon}
                <span className="text-gray-100">{item.text}</span>
                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center bg-white/20 hover:bg-white/35 text-white font-black px-2 py-0.5 rounded transition-colors tracking-wider mr-1 text-xs"
                    dir="ltr"
                  >
                    {item.phone}
                  </a>
                )}
                <span className="text-emerald-400 mr-4 sm:mr-6 text-xs">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <motion.header
        animate={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.06)' : 'none',
        }}
        transition={{ duration: 0.2 }}
        className="w-full px-4 md:px-8 py-3 border-b border-gray-200/80 bg-white"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">
          
          {/* Right Section (RTL): Hamburger menu + Desktop Search */}
          <div className="flex items-center gap-3 flex-1 justify-start">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -mr-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              aria-label="القائمة الرئيسية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center w-full max-w-sm">
              <HeaderSearch variant="inline" />
            </div>
          </div>

          {/* Center Section: Pharmacy Logo & Name */}
          <div className="flex items-center justify-center shrink-0">
            <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Logo className="h-9 md:h-11" scrolled={isScrolled} />
            </Link>
          </div>

          {/* Left Section (RTL): Navigation Links, Mobile Search Icon & Cart */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end">
            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-1.5 ml-2">
              <button 
                onClick={() => scrollToSection('bestsellers-section')}
                className="px-3 py-1.5 text-xs font-black text-gray-800 hover:text-black hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1 border border-gray-200 cursor-pointer"
              >
                <span>الأكثر مبيعاً</span>
              </button>
              
              <button 
                onClick={() => scrollToSection('shop-section')}
                className="px-3 py-1.5 text-xs font-black text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1 border border-gray-200 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>المتجر</span>
              </button>
            </div>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="lg:hidden p-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-xl transition-colors relative cursor-pointer"
              aria-label="بحث عن منتج"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </motion.header>

      {/* Mobile Search Modal */}
      <HeaderSearch 
        variant="modal" 
        isMobileModalOpen={isMobileSearchOpen} 
        onCloseMobileModal={() => setIsMobileSearchOpen(false)} 
      />

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[80] flex flex-col shadow-2xl"
              dir="rtl"
            >
              {/* Drawer Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span className="font-headline text-base font-black text-gray-900">أقسام المتجر</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search Box */}
              <div className="p-4 border-b border-gray-100">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200/80 text-gray-500 rounded-xl text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <span>ابحث عن شامبو، سيروم، واقي شمس...</span>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-extrabold text-gray-700 shadow-2xs">بحث</span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                {navLinks.map((link) => (
                  <button 
                    key={link.name}
                    onClick={link.action}
                    className="w-full text-right px-4 py-3 text-sm font-bold text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <span className="text-gray-300 text-xs">←</span>
                  </button>
                ))}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-black transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>عرض سلة المشتريات ({totalItems})</span>
                </button>

                <a
                  href="https://wa.me/201094349118"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  <span>تواصل معنا على واتساب</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
