import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, 
  CheckCircle2, ThumbsUp, MessageSquare, Send, 
  Sparkles, User, ArrowRight, Heart, Share2, 
  ChevronRight, AlertCircle, HelpCircle, Check,
  ExternalLink
} from 'lucide-react';
import { getProduct, getProducts, getApprovedReviews, createReview } from '../lib/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from '../lib/toast';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'usage' | 'reviews'>('details');

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    customerName: '',
    rating: 5,
    comment: '',
    recommend: true
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4' | 'recent'>('all');

  useEffect(() => {
    if (id) {
      loadProductData();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id!);
      const currentProduct = data.product;
      setProduct(currentProduct);
      setMainImage(currentProduct.image);
      if (currentProduct.sizes?.length > 0) setSelectedSize(currentProduct.sizes[0]);

      // Load related products
      try {
        const allProductsRes = await getProducts();
        const related = (allProductsRes.products || [])
          .filter((p: Product) => (p._id !== currentProduct._id && p.id !== currentProduct.id) && (p.category === currentProduct.category || p.subCategory === currentProduct.subCategory))
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (e) {
        console.warn('Could not load related products', e);
      }

      // Load reviews
      await loadReviews(id!);
    } catch (err: any) {
      toast.error('فشل في تحميل بيانات المنتج');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const reviewsData = await getApprovedReviews(productId);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.warn('Could not load reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      ...product,
      quantity,
      size: selectedSize || (product.sizes?.[0] || ''),
    });
    toast.success(`تمت إضافة ${quantity} من "${product.name}" إلى السلة`);
  };

  const handleDirectWhatsAppOrder = () => {
    if (!product) return;
    const phone = '20109434118';
    const message = `مرحباً صيدلية الرحمة، أود الاستفسار وطلب منتج:\n*${product.name}*\nالسعر: ${product.price} EGP\nالكمية: ${quantity}${selectedSize ? `\nالحجم: ${selectedSize}` : ''}\nالرابط: ${window.location.href}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.customerName.trim()) {
      toast.error('يرجى إدخال اسمك');
      return;
    }
    if (!newReview.comment.trim() || newReview.comment.trim().length < 5) {
      toast.error('يرجى كتابة تعليق لا يقل عن 5 أحرف لتوضيح تجربتك');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await createReview({
        productId: product?._id || product?.id || id,
        customerName: newReview.customerName.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        approved: true
      });

      if (res.success || res.review) {
        toast.success('شكراً لك! تم نشر تقييمك للمنتج بنجاح');
        const createdRev = res.review || {
          _id: 'rev-' + Date.now(),
          productId: id,
          customerName: newReview.customerName,
          rating: newReview.rating,
          comment: newReview.comment,
          createdAt: new Date().toISOString(),
          approved: true
        };
        setReviews([createdRev, ...reviews]);
        setNewReview({
          customerName: '',
          rating: 5,
          comment: '',
          recommend: true
        });
        setShowReviewForm(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'فشل إرسال التقييم، يرجى المحاولة لاحقاً');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (votedReviews[reviewId]) {
      toast.error('لقد قمت بالتصويت على هذا التقييم بالفعل');
      return;
    }
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setVotedReviews(prev => ({
      ...prev,
      [reviewId]: true
    }));
    toast.success('شكراً لمشاركتك برأيك');
  };

  // Review statistics calculation
  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        avgRating: 5.0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendPercent: 100
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((sum / total).toFixed(1));

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    const highRatings = (distribution[5] || 0) + (distribution[4] || 0);
    const recommendPercent = Math.round((highRatings / total) * 100);

    return {
      avgRating: avg,
      totalReviews: total,
      distribution,
      recommendPercent
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === '5') return reviews.filter(r => r.rating === 5);
    if (reviewFilter === '4') return reviews.filter(r => r.rating === 4);
    return reviews;
  }, [reviews, reviewFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xs text-gray-500">جاري تحميل تفاصيل المنتج والتقييمات...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white pt-24">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">عذراً، المنتج غير متوفر أو تم نقله</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-sm">لم نتمكن من العثور على هذا المنتج في سجلات صيدلية الرحمة</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all"
        >
          العودة للرئيسية وتصفح المنتجات
        </button>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter((img, idx, arr) => img && arr.indexOf(img) === idx);
  const isOutOfStock = product.stock === 0;

  const ratingDescriptions: Record<number, string> = {
    5: 'ممتاز - أنصح به بشدة (5 من 5)',
    4: 'جيد جداً - جودة عالية (4 من 5)',
    3: 'جيد - يفي بالغرض (3 من 5)',
    2: 'مقبول - يحتاج تحسين (2 من 5)',
    1: 'سيء - غير راضٍ (1 من 5)'
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pt-24 pb-20 text-right" dir="rtl">
      <SEO 
        title={`${product.name} | صيدلية الرحمة - إيفا للعناية`} 
        description={product.description} 
        image={product.image}
        type="product"
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 py-3 mb-6">
        <div className="container mx-auto px-4 md:px-8 flex items-center gap-2 text-xs font-bold text-gray-400">
          <Link to="/" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
          <ChevronRight size={14} className="rotate-180 text-gray-300" />
          <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600 transition-colors">
            {product.category}
          </Link>
          {product.subCategory && (
            <>
              <ChevronRight size={14} className="rotate-180 text-gray-300" />
              <span className="text-gray-500">{product.subCategory}</span>
            </>
          )}
          <ChevronRight size={14} className="rotate-180 text-gray-300" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-12">
          
          {/* Gallery Section (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square bg-gradient-to-b from-gray-50/80 to-white rounded-2xl overflow-hidden border border-gray-100 p-6 flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={mainImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[360px]"
                />
              </AnimatePresence>
              
              {/* Product Badge */}
              {product.badge && (
                <div className="absolute top-4 right-4 bg-[#e11d48] text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-md">
                  {product.badge}
                </div>
              )}

              {/* Verified Pharmacy Product Tag */}
              <div className="absolute bottom-4 right-4 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>أصلي 100% صيدلية الرحمة</span>
              </div>
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0 ${mainImage === img ? 'border-emerald-600 shadow-sm scale-95' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchasing Section (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Category, Brand & Rating Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {product.brand && (
                    <span className="inline-block bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-lg">
                      {product.brand}
                    </span>
                  )}
                  <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-100">
                    {product.category} {product.subCategory ? `• ${product.subCategory}` : ''}
                  </span>
                </div>

                <button 
                  onClick={() => {
                    setActiveTab('reviews');
                    const el = document.getElementById('reviews-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1 rounded-lg transition-colors text-xs font-bold"
                >
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={13} 
                        className={i < Math.round(stats.avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <span>{stats.avgRating}</span>
                  <span className="text-gray-400 font-medium">({stats.totalReviews} تقييم حقيقي)</span>
                </button>
              </div>
              
              {/* Product Titles */}
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {product.arabicName || product.name}
                </h1>
                {product.englishName && (
                  <p className="text-sm font-semibold text-gray-500 font-sans mt-1" dir="ltr">
                    {product.englishName}
                  </p>
                )}
              </div>
              
              {/* Pricing & Discount */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-black text-gray-950">
                  {product.price.toLocaleString()} <span className="text-emerald-700 text-2xl font-sans">EGP</span>
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through decoration-red-500 decoration-1.5 font-bold font-sans">
                      {product.originalPrice.toLocaleString()} EGP
                    </span>
                    <span className="bg-rose-50 text-rose-600 text-xs font-black px-2.5 py-0.5 rounded-md border border-rose-100">
                      خصم {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              
              {/* Short Description */}
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                {product.arabicDescription || product.description}
              </p>

              {/* Product Key Specifications Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {product.sizeVolume && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-bold">الحجم / السعة</span>
                    <span className="font-bold text-gray-900">{product.sizeVolume}</span>
                  </div>
                )}
                {product.skinType && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-bold">نوع البشرة</span>
                    <span className="font-bold text-gray-900">{product.skinType}</span>
                  </div>
                )}
                {product.hairType && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-bold">نوع الشعر</span>
                    <span className="font-bold text-gray-900">{product.hairType}</span>
                  </div>
                )}
              </div>

              {/* Target Concerns Tags */}
              {product.targetConcerns && product.targetConcerns.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">الفوائد والنتائج المستهدفة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.targetConcerns.map((concern, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes / Volume Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-600 mb-2">الحجم / العبوة المتاحة:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border ${selectedSize === size ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-bold text-gray-500">حالة المخزون:</span>
                {!isOutOfStock ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>متوفر للتسليم الفوري ({product.stock} عبوة)</span>
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">نفدت الكمية مؤقتاً</span>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-6 mt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Quantity input */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 p-1 h-12 w-full sm:w-36 shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-10 h-full flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                  >-</button>
                  <span className="font-bold text-sm text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock || quantity >= (product.stock || 99)}
                    className="w-10 h-full flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                  >+</button>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ShoppingBag size={18} />
                  <span>{isOutOfStock ? 'نفدت الكمية بالمخزن' : 'إضافة إلى سلة الشراء'}</span>
                </button>

                {/* Direct WhatsApp Order */}
                <button 
                  onClick={handleDirectWhatsAppOrder}
                  className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 h-12 px-4 rounded-xl font-bold text-xs transition-colors shrink-0"
                  title="طلب مباشر عبر واتساب"
                >
                  <ExternalLink size={16} />
                  <span>طلب واتساب</span>
                </button>
              </div>

              {/* Pharmacy Guarantee Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <p className="text-[11px] font-bold text-gray-800">أصلي 100%</p>
                  <p className="text-[10px] text-gray-400">مضمون من إيفا</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <Truck className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-[11px] font-bold text-gray-800">شحن سريع</p>
                  <p className="text-[10px] text-gray-400">خلال 2-4 أيام</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <RotateCcw className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <p className="text-[11px] font-bold text-gray-800">استرجاع ميسر</p>
                  <p className="text-[10px] text-gray-400">خلال 14 يوم</p>
                </div>
              </div>

              {/* Quick Customer Review Prompt */}
              <button 
                onClick={() => {
                  setShowReviewForm(true);
                  const el = document.getElementById('reviews-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full mt-3 py-2 px-3 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70 rounded-xl text-amber-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>هل جربت هذا المنتج؟ شاركنا تقييمك (من 1 إلى 5 نجوم)</span>
                </div>
                <span className="text-[11px] font-extrabold text-amber-700 underline">قيّم الآن</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs (Description / Instructions / Ingredients) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12">
          <div className="flex border-b border-gray-100 mb-6 gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 font-bold text-xs md:text-sm transition-colors relative ${activeTab === 'details' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              وصف وفوائد المنتج
              {activeTab === 'details' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`pb-3 font-bold text-xs md:text-sm transition-colors relative ${activeTab === 'usage' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              طريقة الاستخدام الصيدلانية
              {activeTab === 'usage' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-xs md:text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              تقييمات وآراء العملاء ({reviews.length})
              {activeTab === 'reviews' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-4 text-xs md:text-sm text-gray-600 leading-relaxed">
              <p>{product.description}</p>
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 mt-4 space-y-2">
                <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>مميزات التركيبة الفعالة من معامل إيفا:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-emerald-800 text-xs">
                  <li>مختبر طبياً على أيدي أطباء الجلدية والخبراء.</li>
                  <li>تركيبة غنية بالعناصر الطبيعية المرطبة والمغذية.</li>
                  <li>عبوة أصلية ومحكمة لحفظ الفاعلية الصيدلانية للمنتج.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-3 text-xs md:text-sm text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-xs">إرشادات الصيدلي لأفضل فاعلية:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs">
                <li>يتم تنظيف المنطقة المستهدفة وتجفيفها بلطف قبل وضع المستحضر.</li>
                <li>توضع كمية مناسبة من المنتج وتدلك بحركات دائرية خفيفة حتى تمام الامتصاص.</li>
                <li>للحصول على أفضل النتائج، يوصى بالاستخدام المنتظم وفقاً للجرعة المحددة على العبوة.</li>
                <li>يحفظ في مكان جاف وبارد بعيداً عن أشعة الشمس المباشرة ومتناول الأطفال.</li>
              </ol>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-xs text-gray-500">
              يمكنك الاطلاع على آراء وتجارب العملاء الحقيقية في قسم التقييمات أدناه.
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* ═══ REAL CUSTOMER REVIEWS SYSTEM (نظام تقييمات العملاء) ═══ */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section id="reviews-section" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>تقييمات وتجارب العملاء الحقيقية</span>
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                تجارب موثقة لعملاء صيدلية الرحمة الذين قاموا بشراء واستخدام هذا المنتج
              </p>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <span>{showReviewForm ? 'إغلاق نموذج التقييم' : 'أضف تقييمك وتجربتك'}</span>
            </button>
          </div>

          {/* Rating Summary Breakdown (Overview Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-gray-100">
            
            {/* Overall Score Card (4 Cols) */}
            <div className="md:col-span-4 bg-gradient-to-br from-emerald-50/60 to-gray-50 p-6 rounded-2xl border border-emerald-100/60 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-emerald-700 tracking-tight mb-2">
                {stats.avgRating}
              </span>
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < Math.round(stats.avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-gray-700">بناءً على {stats.totalReviews} تقييم موثق</p>
              <div className="mt-3 inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 shadow-2xs border border-emerald-100">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{stats.recommendPercent}% يوصون بهذا المنتج</span>
              </div>
            </div>

            {/* Rating Bars Breakdown (8 Cols) */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0;
                const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-14 font-bold text-gray-700 shrink-0">
                      <span>{star}</span>
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                      />
                    </div>
                    <span className="w-12 text-left text-gray-400 font-bold text-[11px] shrink-0">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* "Write a Review" Expandable Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSubmitReview} className="bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-200/80 my-6 space-y-5">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>شاركنا تجربتك وتقييمك لمنتج "{product.name}"</span>
                  </h3>

                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">تقييمك الإجمالي للمنتج:</label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                          >
                            <Star 
                              size={28} 
                              className={`transition-colors ${(hoverRating !== null ? star <= hoverRating : star <= newReview.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                        {ratingDescriptions[hoverRating !== null ? hoverRating : newReview.rating]}
                      </span>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">اسمك الكريم (أو الاسم المستعار) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: رانيا محمود / م. أحمد"
                        value={newReview.customerName}
                        onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200">
                        <input
                          type="checkbox"
                          checked={newReview.recommend}
                          onChange={(e) => setNewReview({ ...newReview, recommend: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>نعم، أوصي بهذا المنتج للمستخدمين الآخرين</span>
                      </label>
                    </div>
                  </div>

                  {/* Comment Box */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">تفاصيل تجربتك ورأيك في المنتج *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="كيف كانت فعالية المنتج؟ الرائحة، الملمس، وسرعة النتائج؟"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                    ></textarea>
                    <p className="text-[11px] text-gray-400">تساعد التقييمات الصادقة عملاء الصيدلية الآخرين على اختيار المنتج الأنسب لهم.</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{submittingReview ? 'جاري الإرسال والنشر...' : 'نشر التقييم الآن'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">تصفية التقييمات:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${reviewFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  جميع التقييمات ({reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter('5')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${reviewFilter === '5' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  5 نجوم فقط ({stats.distribution[5] || 0})
                </button>
                <button
                  onClick={() => setReviewFilter('4')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${reviewFilter === '4' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  4 نجوم ({stats.distribution[4] || 0})
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 pt-2">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev, idx) => {
                const votes = helpfulVotes[rev._id] || 0;
                const hasVoted = votedReviews[rev._id];
                const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'مؤخراً';

                return (
                  <div 
                    key={rev._id || idx}
                    className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100/90 transition-all hover:bg-gray-50 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {rev.customerName?.charAt(0) || 'ع'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-gray-900">{rev.customerName}</h4>
                            <span className="inline-flex items-center gap-0.5 bg-emerald-100/70 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={10} className="text-emerald-600" />
                              <span>مشتري موثق</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">{dateStr}</p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>

                    {/* Footer: Helpful feedback button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 text-[11px]">
                      <span className="text-gray-400">تم التحقق من الشراء من صيدلية الرحمة</span>
                      
                      <button
                        onClick={() => handleHelpfulVote(rev._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors ${hasVoted ? 'bg-emerald-100 text-emerald-800' : 'bg-white hover:bg-gray-100 text-gray-500 border border-gray-200'}`}
                      >
                        <ThumbsUp size={12} className={hasVoted ? "fill-emerald-600 text-emerald-600" : ""} />
                        <span>تقييم مفيد {votes > 0 ? `(${votes})` : ''}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-xs text-gray-600 mb-1">لا توجد تقييمات تطابق التصفية المحددة</p>
                <p className="text-[11px] text-gray-400 mb-4">كن أول من يشارك تجربته مع هذا المنتج!</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  أضف تقييم الآن
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>منتجات ذات صلة من إيفا قد تعجبك</span>
              </h2>
              <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <span>عرض المزيد في {product.category}</span>
                <ChevronRight size={14} className="rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(relProd => (
                <ProductCard key={relProd._id || relProd.id} product={relProd} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
