import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getProducts } from '../../lib/api';
import { Order, Product } from '../../types';
import {
  DollarSign, ShoppingCart, Package, Users, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Plus, Tag, Eye, BarChart3, Boxes,
  Minus, RefreshCw, CheckCircle, XCircle, MessageCircle, ExternalLink,
  ChevronLeft, Sparkles, ShieldCheck
} from 'lucide-react';

/* ── Lazy chart components ── */
const SalesChart       = lazy(() => import('./charts/SalesChart'));
const OrdersChart      = lazy(() => import('./charts/OrdersChart'));
const RevenueChart     = lazy(() => import('./charts/RevenueChart'));
const TopProductsChart = lazy(() => import('./charts/TopProductsChart'));
const CategoryChart    = lazy(() => import('./charts/CategoryChart'));

/* ── Helper: order badge ── */
function orderStatusClass(s?: string) {
  if (s === 'delivered' || s === 'confirmed') return 'adm-badge adm-badge-green';
  if (s === 'cancelled') return 'adm-badge adm-badge-red';
  if (s === 'shipped' || s === 'processing') return 'adm-badge adm-badge-blue';
  return 'adm-badge adm-badge-orange';
}

function orderStatusArabic(s?: string) {
  switch (s) {
    case 'pending': return 'قيد الانتظار';
    case 'confirmed': return 'تم التأكيد';
    case 'processing': return 'جاري التجهيز';
    case 'shipped': return 'تم الشحن';
    case 'delivered': return 'تم التسليم';
    case 'cancelled': return 'ملغي';
    default: return s || 'قيد الانتظار';
  }
}

function paymentStatusClass(s?: string) {
  if (s === 'paid') return 'adm-badge adm-badge-green';
  if (s === 'failed') return 'adm-badge adm-badge-red';
  return 'adm-badge adm-badge-orange';
}

function paymentStatusArabic(s?: string) {
  switch (s) {
    case 'paid': return 'مدفوع';
    case 'failed': return 'فشل الدفع';
    case 'pending': return 'عند الاستلام';
    default: return s || 'عند الاستلام';
  }
}

/* ── Stat card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: number;
}

function StatCard({ label, value, subtitle, icon: Icon, color, bg, trend }: StatCardProps) {
  const trendClass = trend === undefined ? 'adm-trend-neutral' : trend > 0 ? 'adm-trend-up' : trend < 0 ? 'adm-trend-down' : 'adm-trend-neutral';
  const TrendIcon  = trend === undefined ? Minus : trend > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="adm-stat-card border border-gray-100 dark:border-zinc-800" style={{ '--adm-stat-color': color } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <div className="adm-stat-icon-wrap" style={{ background: bg }}>
          <Icon size={18} style={{ color }} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <div className={`adm-stat-trend ${trendClass} text-xs font-bold flex items-center gap-1`}>
            <TrendIcon size={13} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="adm-stat-label text-xs font-bold text-gray-500 mb-1">{label}</div>
      <div className="adm-stat-value text-2xl font-black text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="text-[11px] text-gray-400 font-medium">{subtitle}</div>
    </div>
  );
}

/* ── Chart loading fallback ── */
function ChartLoader() {
  return (
    <div className="adm-chart-loader flex items-center justify-center p-12 text-sm text-gray-400">
      <RefreshCw size={18} className="animate-spin ml-2 opacity-50" /> جاري تحميل الرسم البياني...
    </div>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([getOrders(), getProducts()]);
        setOrders(oRes.orders || []);
        setProducts(pRes.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Derived metrics ── */
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.total || 0), 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length, [orders]);
  const lowStock = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= 5).length, [products]);
  const outOfStock = useMemo(() => products.filter(p => p.stock === 0).length, [products]);

  /* Unique customers from orders */
  const uniqueCustomers = useMemo(() => {
    const emails = new Set(orders.map(o => o.customer.email || o.customer.phone));
    return emails.size;
  }, [orders]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div className="adm-page-header">
          <div className="adm-skeleton" style={{ height: 28, width: 240, marginBottom: 8 }} />
          <div className="adm-skeleton" style={{ height: 16, width: 180 }} />
        </div>
        <div className="adm-summary-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="adm-skeleton" style={{ height: 130, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">نظرة عامة على المتجر</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              المتجر نشط
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • صيدلية الرحمة (منتجات إيفا للعناية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700"
          >
            <ExternalLink size={14} />
            <span>معاينة المتجر</span>
          </Link>
        </div>
      </div>

      {/* ── Stock Alert Banner if any ── */}
      {outOfStock > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                تنبيه مخزون: يوجد {outOfStock} منتج نفدت كميته بالكامل
              </div>
              <div className="text-xs text-amber-700/80 dark:text-amber-400/80">
                (مثل لوشن الجسم ان ذا كلاودز 240 مل) — يمكنك تعديل المخزون مباشرة من قائمة المنتجات.
              </div>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            تعديل المخزون
          </Link>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المبيعات والأرباح"
          value={`LE ${totalRevenue.toLocaleString()}`}
          subtitle="مبيعات الطلبات المؤكدة"
          icon={DollarSign}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
          trend={14}
        />
        <StatCard
          label="إجمالي الطلبات"
          value={orders.length}
          subtitle={`${pendingOrders} طلب بحاجة لمتابعة`}
          icon={ShoppingCart}
          color="#3b82f6"
          bg="rgba(59,130,246,0.1)"
          trend={8}
        />
        <StatCard
          label="عدد المنتجات النشطة"
          value={products.length}
          subtitle={`${products.length - outOfStock} منتج متوفر حالياً`}
          icon={Package}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.1)"
        />
        <StatCard
          label="إجمالي العملاء"
          value={uniqueCustomers}
          subtitle="عملاء مسجلين ومستلمين"
          icon={Users}
          color="#f59e0b"
          bg="rgba(245,158,11,0.1)"
          trend={5}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
        <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">إجراءات سريعة</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border border-gray-100 dark:border-zinc-800"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Plus size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">إضافة منتج</div>
              <div className="text-[10px] text-gray-400">تحديث الكتالوج</div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border border-gray-100 dark:border-zinc-800"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">الطلبات الواردة</div>
              <div className="text-[10px] text-gray-400">متابعة الشحن</div>
            </div>
          </Link>

          <Link
            to="/admin/coupons"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border border-gray-100 dark:border-zinc-800"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Tag size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">كوبون خصم</div>
              <div className="text-[10px] text-gray-400">إنشاء عروض ترويجية</div>
            </div>
          </Link>

          <Link
            to="/admin/reviews"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border border-gray-100 dark:border-zinc-800"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">تقييمات العملاء</div>
              <div className="text-[10px] text-gray-400">إدارة الآراء</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm text-gray-900 dark:text-white">حجم المبيعات والأرباح</span>
            <span className="text-xs text-gray-400">آخر الفترات</span>
          </div>
          <Suspense fallback={<ChartLoader />}>
            <SalesChart orders={orders} />
          </Suspense>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm text-gray-900 dark:text-white">توزيع المبيعات حسب القسم</span>
            <span className="text-xs text-gray-400">العناية بالشعر، البشرة، الجسم</span>
          </div>
          <Suspense fallback={<ChartLoader />}>
            <CategoryChart orders={orders} />
          </Suspense>
        </div>
      </div>

      {/* ── Top selling products chart ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">أكثر المنتجات طلباً ومبيعاً</span>
            <div className="text-xs text-gray-400 mt-0.5">منتجات آلو إيفا، جولى إيفا، إيفا سنسيز وكلينيك</div>
          </div>
          <Link to="/admin/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>عرض كل المنتجات</span>
            <ChevronLeft size={13} />
          </Link>
        </div>
        <Suspense fallback={<ChartLoader />}>
          <TopProductsChart orders={orders} />
        </Suspense>
      </div>

      {/* ── Recent Orders Table with instant WhatsApp Link ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">أحدث طلبات الشراء</span>
            <div className="text-xs text-gray-400 mt-0.5">طلبات قيد المتابعة والشحن</div>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>جميع الطلبات ({orders.length})</span>
            <ChevronLeft size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 font-bold border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">رقم الطلب</th>
                <th className="px-5 py-3.5">العميل والموقع</th>
                <th className="px-5 py-3.5">المنتجات</th>
                <th className="px-5 py-3.5">الإجمالي</th>
                <th className="px-5 py-3.5">حالة الطلب</th>
                <th className="px-5 py-3.5 text-left">التواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
              {orders.slice(0, 5).map(order => (
                <tr key={order._id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900 dark:text-white text-xs">{order.customer.name}</div>
                    <div className="text-[11px] text-gray-400">{order.customer.governorate} • {order.customer.city}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-600 dark:text-gray-300">
                      {order.items?.map(i => `${i.name.split(' ').slice(0, 3).join(' ')} (×${i.quantity})`).join('، ') || 'منتجات العناية'}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600 text-xs">
                    LE {order.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={orderStatusClass(order.orderStatus)}>
                      {orderStatusArabic(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-left">
                    <a
                      href={`https://wa.me/20${order.customer.phone?.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً ${order.customer.name}، بخصوص طلبك رقم #${order.orderNumber || order._id?.slice(-6)} من صيدلية الرحمة:`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors"
                      title="محادثة واتساب"
                    >
                      <MessageCircle size={13} />
                      <span>واتساب</span>
                    </a>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    لا توجد طلبات مسجلة بعد
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

