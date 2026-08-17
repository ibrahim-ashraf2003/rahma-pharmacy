import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Hero from './Hero';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import BrandTicker from './BrandTicker';
import FAQ from './FAQ';
import { Product } from '../types';
import { SlidersHorizontal, Loader2, Search, X, Flame, Store, Tag, Sparkles, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from '../lib/toast';

const POPULAR_BRANDS = [
  'الكل',
  'Dove',
  'Sunsilk',
  'Garnier',
  'Vaseline',
  'BOBAI',
  'Infinity',
  'StarVille',
  'Rexona',
  'LUX',
  'Dabur Amla',
  'Sensodyne',
  'Head & Shoulders',
  "L'Oreal",
  'Nivea',
  "Johnson's",
  'Eva Cosmetics'
];

const POPULAR_CATEGORIES = [
  { id: 'الكل', label: 'جميع المنتجات' },
  { id: 'العناية بالشعر', label: 'العناية بالشعر' },
  { id: 'العناية بالبشرة', label: 'العناية بالبشرة' },
  { id: 'العناية بالجسم', label: 'العناية بالجسم' },
  { id: 'واقي الشمس', label: 'واقي الشمس' },
  { id: 'مزيلات العرق', label: 'مزيلات العرق' },
  { id: 'منتجات الأطفال', label: 'منتجات الأطفال' },
  { id: 'العناية بالفم والأسنان', label: 'الأسنان والفم' }
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL params as initial state
  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'الكل';
  const urlSubCategory = searchParams.get('subCategory') || 'الكل';
  const urlBrand = searchParams.get('brand') || 'الكل';
  const urlGender = searchParams.get('gender') || 'الكل';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bestseller' | 'latest' | 'offers'>('bestseller');
  
  // Filters State
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeSubCategory, setActiveSubCategory] = useState(urlSubCategory);
  const [activeBrand, setActiveBrand] = useState(urlBrand);
  const [activeSkinType, setActiveSkinType] = useState('الكل');
  const [activeHairType, setActiveHairType] = useState('الكل');
  const [activeGender, setActiveGender] = useState(urlGender);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc' | 'rating' | 'discount' | 'newest'>('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    if (searchParams.get('category')) setActiveCategory(searchParams.get('category')!);
    if (searchParams.get('subCategory')) setActiveSubCategory(searchParams.get('subCategory')!);
    if (searchParams.get('brand')) setActiveBrand(searchParams.get('brand')!);
    if (searchParams.get('gender')) setActiveGender(searchParams.get('gender')!);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/api/products');
        if (response.success && response.products) {
          setProducts(response.products);
        } else {
          toast.error(response.error || 'Failed to fetch products');
        }
      } catch (err) {
        toast.error('Failed to load catalog / فشل تحميل المنتجات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Top bestsellers products for the top showcase
  const topBestsellerProducts = useMemo(() => {
    if (activeTab === 'bestseller') {
      return products.filter(p => p.isBestSeller || p.badge === 'BEST SELLER' || (p.rating && p.rating >= 4.7)).slice(0, 8);
    }
    if (activeTab === 'offers') {
      return products.filter(p => p.discount && p.discount > 0).slice(0, 8);
    }
    return products.filter(p => p.isNewArrival || p.badge === 'NEW').slice(0, 8);
  }, [products, activeTab]);

  // Filter & Sort Products for the main store
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    let result = products.filter((product) => {
      // 1. Search Query matching
      const searchMatch = !q || (
        product.name?.toLowerCase().includes(q) ||
        product.arabicName?.toLowerCase().includes(q) ||
        product.englishName?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.subCategory?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.arabicDescription?.toLowerCase().includes(q) ||
        product.tags?.some(t => t.toLowerCase().includes(q))
      );

      // 2. Category matching
      const categoryMatch = activeCategory === 'الكل' || 
        product.category?.toLowerCase() === activeCategory.toLowerCase();

      // 3. Subcategory matching
      const subCategoryMatch = activeSubCategory === 'الكل' || 
        product.subCategory?.toLowerCase() === activeSubCategory.toLowerCase();

      // 4. Brand matching
      const brandMatch = activeBrand === 'الكل' || 
        product.brand?.toLowerCase() === activeBrand.toLowerCase();

      // 5. Gender matching
      const genderMatch = activeGender === 'الكل' || 
        product.gender === activeGender ||
        product.gender === 'unisex';

      // 6. Skin Type matching
      const skinTypeMatch = activeSkinType === 'الكل' || 
        product.skinType?.toLowerCase().includes(activeSkinType.toLowerCase()) ||
        product.skinType === 'جميع أنواع البشرة';

      // 7. Hair Type matching
      const hairTypeMatch = activeHairType === 'الكل' || 
        product.hairType?.toLowerCase().includes(activeHairType.toLowerCase()) ||
        product.hairType === 'جميع أنواع الشعر';

      // 8. Price matching
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      // 9. Discounts only
      const discountMatch = !onlyDiscounts || Boolean(
        product.discount || (product.originalPrice && product.originalPrice > product.price) || product.badge === 'SALE'
      );

      // 10. In stock only
      const stockMatch = !onlyInStock || (product.stock > 0);

      return (
        searchMatch &&
        categoryMatch &&
        subCategoryMatch &&
        brandMatch &&
        genderMatch &&
        skinTypeMatch &&
        hairTypeMatch &&
        priceMatch &&
        discountMatch &&
        stockMatch
      );
    });

    // Sort Result
    result.sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'discount') {
        const discountA = a.discount || (a.originalPrice ? a.originalPrice - a.price : 0);
        const discountB = b.discount || (b.originalPrice ? b.originalPrice - b.price : 0);
        return discountB - discountA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
      // default: 'popular'
      return (b.rating || 0) * (b.reviewCount || 10) - (a.rating || 0) * (a.reviewCount || 10);
    });

    return result;
  }, [
    products,
    searchQuery,
    activeCategory,
    activeSubCategory,
    activeBrand,
    activeGender,
    activeSkinType,
    activeHairType,
    priceRange,
    onlyDiscounts,
    onlyInStock,
    sortBy
  ]);

  const resetFilters = () => {
    setActiveCategory('الكل');
    setActiveSubCategory('الكل');
    setActiveBrand('الكل');
    setActiveSkinType('الكل');
    setActiveHairType('الكل');
    setActiveGender('الكل');
    setPriceRange([0, 1500]);
    setOnlyDiscounts(false);
    setOnlyInStock(false);
    setSortBy('popular');
    setSearchParams({});
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-right" dir="rtl">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-xl font-bold font-headline text-gray-900">متجر العناية والتجميل • جاري التحميل...</p>
        <p className="text-sm text-gray-500 mt-1 font-medium">جلب المنتجات والأسعار المحدثة بالجنيه المصري</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      <Hero />

      <BrandTicker />

      {/* ═══════════════════════════════════════════════════ */}
      {/* 1. قسم الأكثر مبيعاً وأحدث المنتجات                 */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="bestsellers-section" className="py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Clean Reference Tabs: الأكثر مبيعاً | أحدث المنتجات */}
          <div className="flex items-center gap-6 md:gap-8 mb-8 pb-3 border-b border-gray-100/80">
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`font-headline text-2xl md:text-3xl font-black transition-all cursor-pointer ${
                activeTab === 'bestseller'
                  ? 'text-gray-950 border-b-2 border-gray-950 pb-1'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              الأكثر مبيعاً
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`font-headline text-2xl md:text-3xl font-bold transition-all cursor-pointer ${
                activeTab === 'latest'
                  ? 'text-gray-950 border-b-2 border-gray-950 pb-1 font-black'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              أحدث المنتجات
            </button>
          </div>

          {/* 4-Column Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {topBestsellerProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════ */}
      {/* 2. قسم المتجر الكامل (Full Store Catalog)         */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="shop-section" className="py-12 md:py-16 bg-gray-50/40">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Store Section Title & Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-900 rounded-full text-xs font-black mb-2 shadow-xs">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>تسوق من كافة الأقسام والماركات</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-gray-950 flex items-center gap-2">
              <span>المتجر</span>
              <span className="text-gray-400 font-normal text-lg">({filteredProducts.length} منتج متوفر)</span>
            </h2>
          </div>

          {/* Instant Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none no-scrollbar">
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveSubCategory('الكل');
                }}
                className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center justify-center border cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gray-950 text-white border-black shadow-sm scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Brand Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none no-scrollbar">
            <span className="text-xs font-extrabold text-gray-400 whitespace-nowrap ml-2">الماركة:</span>
            {POPULAR_BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => setActiveBrand(brand)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeBrand === brand
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Controls Bar: Search feedback & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-600">
                عرض {filteredProducts.length} من أصل {products.length} منتج
              </span>

              {searchQuery && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>بحث: "{searchQuery}"</span>
                  <button 
                    onClick={clearSearch}
                    className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {activeBrand !== 'الكل' && (
                <div className="flex items-center gap-1.5 bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold">
                  <span>ماركة: {activeBrand}</span>
                  <button onClick={() => setActiveBrand('الكل')}>
                    <X className="w-3 h-3 text-gray-500 hover:text-black" />
                  </button>
                </div>
              )}

              {activeCategory !== 'الكل' && (
                <div className="flex items-center gap-1.5 bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold">
                  <span>قسم: {activeCategory}</span>
                  <button onClick={() => { setActiveCategory('الكل'); setActiveSubCategory('الكل'); }}>
                    <X className="w-3 h-3 text-gray-500 hover:text-black" />
                  </button>
                </div>
              )}
            </div>

            {/* Sort & Mobile Filters */}
            <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                الفلاتر المتقدمة
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">الترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-black cursor-pointer"
                >
                  <option value="popular">الأكثر شعبية وتقييماً</option>
                  <option value="discount">أعلى نسبة خصم %</option>
                  <option value="priceAsc">السعر: من الأقل للأعلى</option>
                  <option value="priceDesc">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="newest">الأحدث</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Filter Sidebar */}
            <FilterSidebar 
              selectedCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              selectedSubCategory={activeSubCategory}
              onSubCategoryChange={setActiveSubCategory}
              selectedBrand={activeBrand}
              onBrandChange={setActiveBrand}
              selectedSkinType={activeSkinType}
              onSkinTypeChange={setActiveSkinType}
              selectedHairType={activeHairType}
              onHairTypeChange={setActiveHairType}
              selectedGender={activeGender}
              onGenderChange={setActiveGender}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              onlyDiscounts={onlyDiscounts}
              onToggleDiscounts={() => setOnlyDiscounts(!onlyDiscounts)}
              onlyInStock={onlyInStock}
              onToggleInStock={() => setOnlyInStock(!onlyInStock)}
              onReset={resetFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              totalResultsCount={filteredProducts.length}
            />

            {/* Product Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl p-8 border border-gray-200 shadow-xs">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">لم يتم العثور على منتجات تطابق اختياراتك</h3>
                  <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
                    جرب تغيير الفلاتر المحددة أو تقليل شروط البحث للوصول لأكبر عدد من المنتجات المناسبة.
                  </p>
                  <button 
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black transition-all shadow-sm"
                  >
                    إعادة ضبط جميع الفلاتر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FAQ />
    </div>
  );
}
