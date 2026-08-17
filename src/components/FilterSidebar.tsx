import { useState } from 'react';
import { X, RotateCcw, ChevronDown, ChevronUp, Check, Sparkles, Filter } from 'lucide-react';
import { MAIN_CATEGORIES, POPULAR_BRANDS, SKIN_TYPES, HAIR_TYPES } from '../data/taxonomy';

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSubCategory: string;
  onSubCategoryChange: (subCategory: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedSkinType: string;
  onSkinTypeChange: (skinType: string) => void;
  selectedHairType: string;
  onHairTypeChange: (hairType: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  onlyDiscounts: boolean;
  onToggleDiscounts: () => void;
  onlyInStock: boolean;
  onToggleInStock: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  totalResultsCount?: number;
}

export default function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  selectedSubCategory,
  onSubCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedSkinType,
  onSkinTypeChange,
  selectedHairType,
  onHairTypeChange,
  selectedGender,
  onGenderChange,
  priceRange,
  onPriceChange,
  onlyDiscounts,
  onToggleDiscounts,
  onlyInStock,
  onToggleInStock,
  onReset,
  isOpen,
  onClose,
  totalResultsCount
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subcategories: true,
    brands: true,
    price: true,
    skinHair: true,
    gender: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const currentCategoryObj = MAIN_CATEGORIES.find(c => c.nameAr === selectedCategory);

  return (
    <aside 
      className={`
        fixed inset-y-0 right-0 z-[70] w-80 max-w-[90vw] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-0 lg:h-auto lg:w-72 lg:bg-transparent lg:border-l-0 lg:shadow-none
      `}
      dir="rtl"
    >
      <div className="h-full flex flex-col p-5 lg:p-0">
        {/* Mobile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-900" />
            <h2 className="text-base font-black font-headline text-gray-900">تصفية المنتجات</h2>
            {totalResultsCount !== undefined && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                {totalResultsCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            aria-label="إغلاق الفلتر"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Quick Header with Reset */}
        <div className="hidden lg:flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-bold text-gray-900">فلاتر البحث</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold transition-colors"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة ضبط</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 text-right pr-1">
          
          {/* Quick Filter Toggles (Discounts & Stock) */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                العروض والخصومات فقط
              </span>
              <input
                type="checkbox"
                checked={onlyDiscounts}
                onChange={onToggleDiscounts}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group pt-1 border-t border-gray-200/50">
              <span className="text-xs font-bold text-gray-800">
                المنتجات المتوفرة فقط
              </span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={onToggleInStock}
                className="w-4 h-4 rounded text-gray-900 focus:ring-black cursor-pointer accent-gray-900"
              />
            </label>
          </div>

          {/* 1. Main Categories (14 Categories) */}
          <div className="border-b border-gray-100 pb-5">
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
            >
              <span>القسم الرئيسي ({MAIN_CATEGORIES.length})</span>
              {expandedSections.categories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSections.categories && (
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    onCategoryChange('الكل');
                    onSubCategoryChange('الكل');
                  }}
                  className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedCategory === 'الكل'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>جميع الأقسام</span>
                  {selectedCategory === 'الكل' && <Check className="w-3.5 h-3.5" />}
                </button>

                {MAIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.nameAr);
                      onSubCategoryChange('الكل');
                    }}
                    className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedCategory === cat.nameAr
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat.nameAr}</span>
                    {selectedCategory === cat.nameAr && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Subcategories (When a specific category is chosen) */}
          {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
            <div className="border-b border-gray-100 pb-5">
              <button
                onClick={() => toggleSection('subcategories')}
                className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
              >
                <span>القسم الفرعي ({currentCategoryObj.subcategories.length})</span>
                {expandedSections.subcategories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandedSections.subcategories && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => onSubCategoryChange('الكل')}
                    className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedSubCategory === 'الكل'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>كل فروع {currentCategoryObj.nameAr}</span>
                    {selectedSubCategory === 'الكل' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {currentCategoryObj.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => onSubCategoryChange(sub.nameAr)}
                      className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        selectedSubCategory === sub.nameAr
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{sub.nameAr}</span>
                      {selectedSubCategory === sub.nameAr && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Brands (Top Brands in Egypt) */}
          <div className="border-b border-gray-100 pb-5">
            <button
              onClick={() => toggleSection('brands')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
            >
              <span>العلامة التجارية / Brand</span>
              {expandedSections.brands ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSections.brands && (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => onBrandChange('الكل')}
                  className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedBrand === 'الكل'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>جميع الماركات</span>
                  {selectedBrand === 'الكل' && <Check className="w-3.5 h-3.5" />}
                </button>

                {POPULAR_BRANDS.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => onBrandChange(brand.nameEn)}
                    className={`flex items-center justify-between w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedBrand === brand.nameEn || selectedBrand === brand.nameAr
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{brand.nameAr} ({brand.nameEn})</span>
                    {(selectedBrand === brand.nameEn || selectedBrand === brand.nameAr) && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Price Range */}
          <div className="border-b border-gray-100 pb-5">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
            >
              <span>السعر (بالجنيه المصري EGP)</span>
              {expandedSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSections.price && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <span>{priceRange[0]} ج.م</span>
                  <span>{priceRange[1]} ج.م</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="25"
                  value={priceRange[1]}
                  onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-gray-900 cursor-pointer"
                />
                {/* Price Presets */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onPriceChange([0, 100])}
                    className="py-1 px-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 text-center"
                  >
                    أقل من 100 ج.م
                  </button>
                  <button
                    type="button"
                    onClick={() => onPriceChange([100, 300])}
                    className="py-1 px-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 text-center"
                  >
                    100 - 300 ج.م
                  </button>
                  <button
                    type="button"
                    onClick={() => onPriceChange([300, 600])}
                    className="py-1 px-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 text-center"
                  >
                    300 - 600 ج.م
                  </button>
                  <button
                    type="button"
                    onClick={() => onPriceChange([0, 1500])}
                    className="py-1 px-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 text-center"
                  >
                    الكل (حتى 1500)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Target Gender */}
          <div className="border-b border-gray-100 pb-5">
            <button
              onClick={() => toggleSection('gender')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
            >
              <span>الفئة المستهدفة</span>
              {expandedSections.gender ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSections.gender && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'الكل', label: 'الجميع' },
                  { id: 'women', label: 'نسائي (Women)' },
                  { id: 'men', label: 'رجالي (Men)' },
                  { id: 'kids', label: 'أطفال (Kids)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onGenderChange(item.id)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border text-center transition-all ${
                      selectedGender === item.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Skin & Hair Types */}
          <div className="pb-6">
            <button
              onClick={() => toggleSection('skinHair')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-900 mb-3"
            >
              <span>نوع البشرة والشعر</span>
              {expandedSections.skinHair ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSections.skinHair && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">نوع البشرة:</span>
                  <select
                    value={selectedSkinType}
                    onChange={(e) => onSkinTypeChange(e.target.value)}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2 text-gray-800 outline-none focus:border-black"
                  >
                    <option value="الكل">جميع أنواع البشرة</option>
                    {SKIN_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">نوع الشعر:</span>
                  <select
                    value={selectedHairType}
                    onChange={(e) => onHairTypeChange(e.target.value)}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2 text-gray-800 outline-none focus:border-black"
                  >
                    <option value="الكل">جميع أنواع الشعر</option>
                    {HAIR_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Mobile bottom button */}
        <div className="pt-4 border-t border-gray-100 lg:hidden">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 rounded-2xl font-bold text-xs shadow-md"
          >
            تطبيق الفلاتر ({totalResultsCount ?? 0} منتج)
          </button>
        </div>
      </div>
    </aside>
  );
}
