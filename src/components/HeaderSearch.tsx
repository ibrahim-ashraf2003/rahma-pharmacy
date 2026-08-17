import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ChevronLeft, Sparkles, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProducts } from '../lib/api';
import { Product } from '../types';

interface HeaderSearchProps {
  isMobileModalOpen?: boolean;
  onCloseMobileModal?: () => void;
  variant?: 'inline' | 'modal';
}

const POPULAR_SEARCHES = [
  'شامبو',
  'Shampoo',
  'بانتين',
  'Pantene',
  'ضد القشرة',
  'Anti-Dandruff',
  'سيروم',
  'Serum',
  'واقي شمس',
  'Sunscreen',
  'لاروش بوزيه',
  'غارنييه',
  'ميبلين',
  'إيفا'
];

export default function HeaderSearch({
  isMobileModalOpen,
  onCloseMobileModal,
  variant = 'inline',
}: HeaderSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch products once for fast client-side predictive search
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await getProducts();
        if (isMounted && res?.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn('Failed to load products for search autocomplete', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search query
  const matchingProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(q) || p.arabicName?.toLowerCase().includes(q) || p.englishName?.toLowerCase().includes(q);
      const brandMatch = p.brand?.toLowerCase().includes(q);
      const catMatch = p.category?.toLowerCase().includes(q);
      const subCatMatch = p.subCategory?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q) || p.arabicDescription?.toLowerCase().includes(q) || p.englishDescription?.toLowerCase().includes(q);
      const tagsMatch = p.tags?.some(tag => tag.toLowerCase().includes(q));
      const concernsMatch = p.targetConcerns?.some(c => c.toLowerCase().includes(q));
      return nameMatch || brandMatch || catMatch || subCatMatch || descMatch || tagsMatch || concernsMatch;
    });
  }, [products, query]);

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    if (onCloseMobileModal) onCloseMobileModal();
    navigate(`/product/${productId}`);
  };

  const handleExecuteSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    if (onCloseMobileModal) onCloseMobileModal();
    
    // If currently on home page, scroll to shop-section and update URL
    if (location.pathname === '/') {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}#shop-section`);
      const shopSection = document.getElementById('shop-section');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}#shop-section`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(query);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (onCloseMobileModal) onCloseMobileModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseMobileModal]);

  // Modal variant for mobile view
  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {isMobileModalOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-start bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full rounded-b-3xl shadow-2xl p-4 md:p-6 text-right max-h-[85vh] flex flex-col"
              dir="rtl"
            >
              {/* Top Search Input Bar */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <button
                  onClick={onCloseMobileModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  aria-label="إغلاق البحث"
                >
                  <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    placeholder="ابحث عن منتج، قسم، أو علامة تجارية..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-11 pl-10 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3.5 pointer-events-none" />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute left-3 p-1 text-gray-400 hover:text-gray-600 rounded-full bg-gray-200/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
              </div>

              {/* Suggestions / Results container */}
              <div className="overflow-y-auto flex-1 py-4 space-y-4">
                {query.trim() === '' ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>الأكثر بحثاً في صيدلية الرحمة:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setQuery(item);
                            handleExecuteSearch(item);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3 px-1">
                      <span>نتائج البحث ({matchingProducts.length})</span>
                      {matchingProducts.length > 0 && (
                        <button
                          onClick={() => handleExecuteSearch(query)}
                          className="text-emerald-600 hover:underline font-bold"
                        >
                          عرض الكل في المتجر
                        </button>
                      )}
                    </div>

                    {matchingProducts.length > 0 ? (
                      <div className="space-y-2">
                        {matchingProducts.map((product) => (
                          <div
                            key={product._id || product.id}
                            onClick={() => handleSelectProduct(product._id || product.id)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 border border-gray-100/80 transition-colors cursor-pointer"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-contain rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {product.category}
                                </span>
                                {product.badge && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-black text-gray-950 mt-1">
                                {product.price.toLocaleString()} EGP
                              </p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-xs">لا توجد منتجات تطابق "{query}"</p>
                        <p className="text-[11px] mt-1">جرب البحث بكلمات أخرى مثل (شامبو، إيفا، سيروم)</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom search button */}
              {query.trim() && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleExecuteSearch(query)}
                    className="w-full bg-black text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <span>بحث في كامل المتجر عن "{query}"</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Inline variant for Desktop Header
  return (
    <div ref={containerRef} className="relative w-full max-w-xs xl:max-w-sm" dir="rtl">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder="ابحث عن منتج، قسم..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full bg-gray-50/90 hover:bg-gray-100/90 focus:bg-white border border-gray-200/80 focus:border-black rounded-full pr-9 pl-8 py-1.5 text-xs font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute left-2.5 p-0.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            title="مسح"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Predictive Instant Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] text-right"
          >
            <div className="p-3 max-h-[380px] overflow-y-auto space-y-3">
              {query.trim() === '' ? (
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mb-2 px-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>الأكثر بحثاً:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQuery(item);
                          handleExecuteSearch(item);
                        }}
                        className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold transition-colors border border-gray-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-2 px-1">
                    <span>نتائج سريعة ({matchingProducts.length})</span>
                    {matchingProducts.length > 0 && (
                      <span className="text-[10px] text-emerald-600">اضغط للمعاينة</span>
                    )}
                  </div>

                  {matchingProducts.length > 0 ? (
                    <div className="space-y-1">
                      {matchingProducts.slice(0, 5).map((product) => (
                        <div
                          key={product._id || product.id}
                          onClick={() => handleSelectProduct(product._id || product.id)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 p-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                              {product.name}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>{product.category}</span>
                              <span className="font-bold text-gray-950">{product.price.toLocaleString()} EGP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-xs">
                      <p className="font-bold">لا توجد نتائج لـ "{query}"</p>
                      <p className="text-[10px] text-gray-400 mt-1">جرب كلمات بحث مختلفة</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {query.trim() && matchingProducts.length > 0 && (
              <button
                type="button"
                onClick={() => handleExecuteSearch(query)}
                className="w-full bg-gray-50 hover:bg-gray-100 border-t border-gray-100 p-2.5 text-center text-xs font-bold text-gray-800 transition-colors block"
              >
                عرض كل نتائج البحث ({matchingProducts.length} منتج) ←
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
