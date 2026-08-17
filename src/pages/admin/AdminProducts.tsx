import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../../lib/api';
import ImageUploader from '../../components/admin/ImageUploader';
import { toast } from '../../lib/toast';
import { Plus, Trash2, Edit2, Package, Search, Filter, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { MAIN_CATEGORIES, POPULAR_BRANDS, SKIN_TYPES, HAIR_TYPES } from '../../data/taxonomy';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Form state for cosmetic product management
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    englishName: '',
    brand: 'L’Oréal Paris',
    description: '',
    arabicDescription: '',
    price: '',
    originalPrice: '',
    image: '',
    category: MAIN_CATEGORIES[0]?.nameAr || 'العناية بالشعر',
    subCategory: '',
    sizeVolume: '200 مل',
    skinType: 'جميع أنواع البشرة',
    hairType: 'جميع أنواع الشعر',
    targetConcerns: '',
    stock: '25',
    badge: '',
    featured: false,
    active: true,
    sourceWebsite: 'Amazon.eg',
    priceSourceUrl: '',
    imageSourceUrl: '',
    priceStatus: 'verified' as 'verified' | 'verification_required' | 'outdated',
    lastPriceUpdate: new Date().toISOString().split('T')[0],
    sku: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (err: any) {
      toast.error('Failed to load products / فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        arabicName: product.arabicName || product.name,
        englishName: product.englishName || '',
        brand: product.brand || 'L’Oréal Paris',
        description: product.description || '',
        arabicDescription: product.arabicDescription || product.description || '',
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        image: product.image,
        category: product.category || 'العناية بالشعر',
        subCategory: product.subCategory || '',
        sizeVolume: product.sizeVolume || '',
        skinType: product.skinType || 'جميع أنواع البشرة',
        hairType: product.hairType || 'جميع أنواع الشعر',
        targetConcerns: product.targetConcerns?.join(', ') || '',
        stock: product.stock.toString(),
        badge: product.badge || '',
        featured: product.featured || false,
        active: product.active !== undefined ? product.active : true,
        sourceWebsite: product.sourceWebsite || 'Amazon.eg',
        priceSourceUrl: product.priceSourceUrl || '',
        imageSourceUrl: product.imageSourceUrl || '',
        priceStatus: (product.priceStatus as any) || 'verified',
        lastPriceUpdate: product.lastPriceUpdate || new Date().toISOString().split('T')[0],
        sku: product.sku || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        arabicName: '',
        englishName: '',
        brand: 'L’Oréal Paris',
        description: '',
        arabicDescription: '',
        price: '',
        originalPrice: '',
        image: '',
        category: MAIN_CATEGORIES[0]?.nameAr || 'العناية بالشعر',
        subCategory: '',
        sizeVolume: '',
        skinType: 'جميع أنواع البشرة',
        hairType: 'جميع أنواع الشعر',
        targetConcerns: '',
        stock: '25',
        badge: '',
        featured: false,
        active: true,
        sourceWebsite: 'Amazon.eg',
        priceSourceUrl: '',
        imageSourceUrl: '',
        priceStatus: 'verified',
        lastPriceUpdate: new Date().toISOString().split('T')[0],
        sku: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error('يرجى وضع رابط صورة المنتج أو رفعها');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('يرجى كتابة سعر صحيح وموجب');
      return;
    }

    const concernsList = formData.targetConcerns 
      ? formData.targetConcerns.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const productData: any = {
      name: formData.arabicName.trim() || formData.name.trim(),
      arabicName: formData.arabicName.trim() || formData.name.trim(),
      englishName: formData.englishName.trim() || undefined,
      brand: formData.brand.trim() || undefined,
      description: formData.arabicDescription.trim() || formData.description.trim(),
      arabicDescription: formData.arabicDescription.trim() || formData.description.trim(),
      price: priceNum,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim() || undefined,
      sizeVolume: formData.sizeVolume.trim() || undefined,
      skinType: formData.skinType.trim() || undefined,
      hairType: formData.hairType.trim() || undefined,
      targetConcerns: concernsList,
      stock: parseInt(formData.stock) || 0,
      badge: formData.badge.trim() || undefined,
      featured: formData.featured,
      active: formData.active,
      sourceWebsite: formData.sourceWebsite.trim() || undefined,
      priceSourceUrl: formData.priceSourceUrl.trim() || undefined,
      imageSourceUrl: formData.imageSourceUrl.trim() || undefined,
      priceStatus: formData.priceStatus,
      lastPriceUpdate: formData.lastPriceUpdate || new Date().toISOString().split('T')[0],
      sku: formData.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`
    };

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id || (editingProduct as any).id, productData);
        toast.success('تم تحديث بيانات وسعر المنتج بنجاح');
      } else {
        await createProduct(productData);
        toast.success('تمت إضافة المنتج إلى كتالوج المتجر بنجاح');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'فشل حفظ المنتج');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من الكتالوج؟')) return;
    try {
      await deleteProduct(id);
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (err: any) {
      toast.error('فشل حذف المنتج');
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      p.name?.toLowerCase().includes(q) ||
      p.arabicName?.toLowerCase().includes(q) ||
      p.englishName?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const currentCategorySubcategories = MAIN_CATEGORIES.find(c => c.nameAr === formData.category)?.subcategories || [];

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xs">جاري تحميل كتالوج المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Header & Quick stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">إدارة كتالوج المنتجات والأسعار</h1>
          <p className="text-gray-500 font-bold text-xs">
            إضافة وتعديل المنتجات وتحديث الأسعار ومصادر التوثيق ({products.length} منتج مسجل)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الماركة..." 
              className="bg-gray-50 border border-gray-200 pr-10 pl-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-black w-48 sm:w-60"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
          >
            <option value="All">جميع الأقسام ({products.length})</option>
            {MAIN_CATEGORIES.map(c => (
              <option key={c.id} value={c.nameAr}>{c.nameAr}</option>
            ))}
          </select>

          <button 
            onClick={() => handleOpenModal()}
            className="bg-gray-950 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs font-black">
                <th className="px-6 py-4">المنتج والتصنيف</th>
                <th className="px-6 py-4">الماركة</th>
                <th className="px-6 py-4">السعر والخصم</th>
                <th className="px-6 py-4">مصدر السعر والتوثيق</th>
                <th className="px-6 py-4">المخزون</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">لا توجد منتجات تطابق البحث</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Product info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-200 p-1 shrink-0" 
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-xs text-gray-900 truncate">
                            {product.arabicName || product.name}
                          </p>
                          {product.englishName && (
                            <p className="text-[10px] text-gray-400 font-sans truncate" dir="ltr">
                              {product.englishName}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              {product.category}
                            </span>
                            {product.subCategory && (
                              <span className="text-[10px] text-gray-400">
                                • {product.subCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-[11px]">
                        {product.brand || 'غير محدد'}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-gray-950">
                          {product.price.toLocaleString()} ج.م
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-rose-500 line-through font-bold">
                            {product.originalPrice.toLocaleString()} ج.م
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source verification */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span className="font-bold text-[11px] text-gray-800">
                            {product.sourceWebsite || 'المتجر الرسمي'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          محدث: {product.lastPriceUpdate || 'مؤخراً'}
                        </span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        product.stock <= 0 ? 'bg-red-50 text-red-600' :
                        product.stock <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {product.stock <= 0 ? 'نفد' : `${product.stock} عبوة`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-black rounded-lg transition-colors"
                          title="تعديل المنتج"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id || (product as any).id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto text-right my-8" dir="rtl">
            <h2 className="text-xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">
              {editingProduct ? 'تعديل بيانات المنتج وسعره الموثق' : 'إضافة منتج تجميل وعناية جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.arabicName}
                    onChange={e => setFormData({ ...formData, arabicName: e.target.value, name: e.target.value })}
                    placeholder="مثال: شامبو بانتين برو-في للشعر التالف 400 مل"
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={formData.englishName}
                    onChange={e => setFormData({ ...formData, englishName: e.target.value })}
                    placeholder="e.g. Pantene Pro-V Milky Damage Repair Shampoo"
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Brand & Main Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العلامة التجارية / Brand</label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  >
                    {POPULAR_BRANDS.map(b => (
                      <option key={b.id} value={b.nameEn}>{b.nameAr} ({b.nameEn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القسم الرئيسي (من الـ 14 قسم)</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  >
                    {MAIN_CATEGORIES.map(c => (
                      <option key={c.id} value={c.nameAr}>{c.icon} {c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القسم الفرعي</label>
                  {currentCategorySubcategories.length > 0 ? (
                    <select
                      value={formData.subCategory}
                      onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                    >
                      <option value="">اختر قسماً فرعياً...</option>
                      {currentCategorySubcategories.map(sub => (
                        <option key={sub.id} value={sub.nameAr}>{sub.nameAr}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                      placeholder="مثال: شامبو يومي"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                    />
                  )}
                </div>
              </div>

              {/* Price, Original Price, Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">السعر الفعلي بالجنيه (EGP) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="120"
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">السعر الأصلي قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="150"
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الكمية المتوفرة بالمخزن</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Source Verification details */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>بيانات توثيق السعر من المصادر الرسمية (Amazon.eg / الصيدليات)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">المتجر / المصدر الرسمي</label>
                    <input
                      type="text"
                      value={formData.sourceWebsite}
                      onChange={e => setFormData({ ...formData, sourceWebsite: e.target.value })}
                      placeholder="مثال: Amazon.eg"
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">رابط المصدر للتحقق</label>
                    <input
                      type="url"
                      value={formData.priceSourceUrl}
                      onChange={e => setFormData({ ...formData, priceSourceUrl: e.target.value })}
                      placeholder="https://amazon.eg/..."
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 outline-none focus:border-black font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">حالة السعر</label>
                    <select
                      value={formData.priceStatus}
                      onChange={e => setFormData({ ...formData, priceStatus: e.target.value as any })}
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 outline-none focus:border-black"
                    >
                      <option value="verified">موثق ومعتمد رسمي</option>
                      <option value="verification_required">يحتاج مراجعة</option>
                      <option value="outdated">سعر قديم</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attributes: Size, Skin Type, Hair Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الحجم / السعة</label>
                  <input
                    type="text"
                    value={formData.sizeVolume}
                    onChange={e => setFormData({ ...formData, sizeVolume: e.target.value })}
                    placeholder="مثال: 400 مل / 50 جم"
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع البشرة الملائم</label>
                  <select
                    value={formData.skinType}
                    onChange={e => setFormData({ ...formData, skinType: e.target.value })}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  >
                    <option value="جميع أنواع البشرة">جميع أنواع البشرة</option>
                    {SKIN_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع الشعر الملائم</label>
                  <select
                    value={formData.hairType}
                    onChange={e => setFormData({ ...formData, hairType: e.target.value })}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  >
                    <option value="جميع أنواع الشعر">جميع أنواع الشعر</option>
                    {HAIR_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target concerns */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الفوائد والاهتمامات المستهدفة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={formData.targetConcerns}
                  onChange={e => setFormData({ ...formData, targetConcerns: e.target.value })}
                  placeholder="مثال: ترطيب مكثف, علاج التقصف, حماية من الحرارة"
                  className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              {/* Image URL / Uploader */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رابط صورة المنتج *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://m.media-amazon.com/images/I/..."
                  className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-sans mb-2"
                  dir="ltr"
                />
                <ImageUploader 
                  currentImage={formData.image} 
                  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image: url }))} 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف والمميزات *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.arabicDescription}
                  onChange={e => setFormData({ ...formData, arabicDescription: e.target.value, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً وشاملاً لفوائد المنتج وطريقة استعماله..."
                  className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              {/* Badge & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded accent-gray-950"
                    />
                    <span>مميز في الواجهة</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded accent-gray-950"
                    />
                    <span>متاح للبيع (Active)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gray-950 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'جاري الحفظ...' : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج')}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
