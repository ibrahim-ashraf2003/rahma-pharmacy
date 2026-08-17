import React, { useEffect, useState, useMemo } from 'react';
import { getReviews, deleteReview, updateReview, getProducts } from '../../lib/api';
import { toast } from '../../lib/toast';
import { Star, MessageSquare, Trash2, Eye, EyeOff, CheckCircle2, Search, Filter } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  const fetchReviewsAndProducts = async () => {
    try {
      setLoading(true);
      const [revRes, prodRes] = await Promise.all([
        getReviews(),
        getProducts().catch(() => ({ products: [] }))
      ]);

      setReviews(revRes.reviews || []);
      
      const map: Record<string, string> = {};
      (prodRes.products || []).forEach((p: any) => {
        if (p._id) map[p._id] = p.name;
        if (p.id) map[p.id] = p.name;
      });
      setProductsMap(map);
    } catch (err: any) {
      toast.error(err.message || 'فشل تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndProducts();
  }, []);

  const handleToggleApproval = async (review: any) => {
    try {
      const updatedStatus = !review.approved;
      await updateReview(review._id, { approved: updatedStatus });
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, approved: updatedStatus } : r));
      toast.success(updatedStatus ? 'تمت الموافقة ونشر التقييم في المتجر' : 'تم إخفاء التقييم من المتجر');
    } catch (err) {
      toast.error('فشل تحديث حالة التقييم');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟')) return;
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('تم حذف التقييم بنجاح');
    } catch (err) {
      toast.error('فشل حذف التقييم');
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      const pName = productsMap[rev.productId] || '';
      const matchesSearch = 
        (rev.customerName && rev.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rev.comment && rev.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'approved' && rev.approved) ||
        (statusFilter === 'hidden' && !rev.approved);

      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, statusFilter, productsMap]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
      <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-xs">جاري تحميل تقييمات العملاء...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>إدارة تقييمات العملاء</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            مراجعة واعتماد أو إخفاء التقييمات المعروضة في صفحات المنتجات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700">
            إجمالي التقييمات: {reviews.length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث باسم العميل، المنتج، أو نص التقييم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/20 outline-none"
        >
          <option value="all">جميع الحالات</option>
          <option value="approved">المنشورة (Approved)</option>
          <option value="hidden">المخفية (Hidden)</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 font-bold border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">التقييم</th>
                <th className="px-6 py-4 w-1/3">التعليق والملاحظات</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
              {filteredReviews.map((review) => {
                const prodName = productsMap[review.productId] || `منتج #${review.productId?.slice(-6)}`;
                return (
                  <tr key={review._id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{review.customerName}</div>
                      <div className="text-[10px] text-gray-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG') : 'مؤخراً'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium max-w-[180px] truncate" title={prodName}>
                      {prodName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <span>{review.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <p className="line-clamp-2 leading-relaxed" title={review.comment}>
                        "{review.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleApproval(review)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          review.approved 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {review.approved ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>منشور بالمتجر</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>مخفي</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button 
                        onClick={() => handleDelete(review._id)} 
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف التقييم"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">لا توجد تقييمات تطابق معايير البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
