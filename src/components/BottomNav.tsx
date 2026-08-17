import { ShoppingBag, Search, Home, Store } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const { totalItems, setIsCartOpen, setView } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const shopSection = document.getElementById('shop-section');
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setView('shop');
      const shopSection = document.getElementById('shop-section');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }
  };

  const handleSearchClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setView('shop');
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="بحث"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.25rem)' }}
      aria-label="التنقل السريع للهاتف"
      dir="rtl"
    >
      <div className="grid grid-cols-4 items-center h-16 px-2 max-w-md mx-auto">
        
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center gap-1 group py-1 transition-all active:scale-95 text-gray-700 hover:text-emerald-700"
          aria-label="الصفحة الرئيسية"
        >
          <Home className="w-5 h-5 text-gray-600 group-hover:text-emerald-700 transition-colors" strokeWidth={1.75} />
          <span className="text-[11px] font-bold tracking-tight text-gray-700 group-hover:text-emerald-700 transition-colors">
            الرئيسية
          </span>
        </button>

        {/* 2. المتجر */}
        <button
          type="button"
          onClick={handleShopClick}
          className="flex flex-col items-center justify-center gap-1 group py-1 transition-all active:scale-95 text-gray-700 hover:text-emerald-700"
          aria-label="تصفح المتجر"
        >
          <Store className="w-5 h-5 text-gray-600 group-hover:text-emerald-700 transition-colors" strokeWidth={1.75} />
          <span className="text-[11px] font-bold tracking-tight text-gray-700 group-hover:text-emerald-700 transition-colors">
            المتجر
          </span>
        </button>

        {/* 3. البحث */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center gap-1 group py-1 transition-all active:scale-95 text-gray-700 hover:text-emerald-700"
          aria-label="البحث عن منتج"
        >
          <Search className="w-5 h-5 text-gray-600 group-hover:text-emerald-700 transition-colors" strokeWidth={1.75} />
          <span className="text-[11px] font-bold tracking-tight text-gray-700 group-hover:text-emerald-700 transition-colors">
            البحث
          </span>
        </button>

        {/* 4. السلة */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 group relative py-1 transition-all active:scale-95 text-gray-700 hover:text-emerald-700"
          aria-label="سلة المشتريات"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-emerald-700 transition-colors" strokeWidth={1.75} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight text-gray-700 group-hover:text-emerald-700 transition-colors">
            السلة
          </span>
        </button>

      </div>
    </nav>
  );
}
