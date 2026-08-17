import React, { useEffect, useState, useMemo } from 'react';
import { Order } from '../../types';
import { toast } from '../../lib/toast';
import { ShoppingCart, Search, Filter, MessageCircle, ChevronDown, MapPin, Phone, User, Calendar, CheckCircle2 } from 'lucide-react';

const API_BASE = '';

function orderStatusBadgeClass(s?: string) {
  switch (s) {
    case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
    case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default: return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    const token = localStorage.getItem('tammi_token');
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || 'فشل تحميل الطلبات');
      }
    } catch (err: any) {
      toast.error('فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('tammi_token');
    
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus as any } : o));

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (!res.ok) throw new Error('Update failed');
      toast.success(`تم تحديث حالة الطلب بنجاح`);
    } catch (err) {
      toast.error('فشل تحديث حالة الطلب');
      setOrders(previousOrders);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery) ||
        (order._id && order._id.includes(searchQuery)) ||
        (order.orderNumber && order.orderNumber.includes(searchQuery));
      
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
      <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-xs">جاري تحميل سجل الطلبات...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة طلبات الشراء</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            متابعة الشحن والتوصيل وتحديث الحالات والتواصل المباشر مع العملاء
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
            إجمالي الطلبات: {orders.length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black/5 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black/5 outline-none"
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">قيد الانتظار (Pending)</option>
          <option value="confirmed">تم التأكيد (Confirmed)</option>
          <option value="shipped">تم الشحن (Shipped)</option>
          <option value="delivered">تم التسليم (Delivered)</option>
          <option value="cancelled">ملغي (Cancelled)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 font-bold border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">بيانات العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">حالة الطلب</th>
                <th className="px-6 py-4 text-left">التفاصيل والتواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrder === order._id;
                return (
                  <React.Fragment key={order._id}>
                    <tr
                      className={`hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/50 dark:bg-zinc-800/30' : ''}`}
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id || null)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white text-xs">{order.customer.name}</span>
                          <span className="text-[11px] text-gray-400">{order.customer.phone} • {order.customer.governorate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        LE {order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.orderStatus || 'pending'}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id!, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all outline-none ${orderStatusBadgeClass(order.orderStatus)}`}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">تم التأكيد</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id || null)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          >
                            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <tr className="bg-gray-50/60 dark:bg-zinc-800/20">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping info */}
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-3">
                              <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                <MapPin size={14} className="text-blue-500" />
                                <span>عنوان الشحن والتوصيل</span>
                              </h4>
                              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
                                <p className="font-bold">المحافظة: {order.customer.governorate} - {order.customer.city || 'المدينة الرئيسية'}</p>
                                <p>العنوان: {order.customer.address}</p>
                                <p>الهاتف: <span className="font-mono">{order.customer.phone}</span></p>
                              </div>
                              {order.customer.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                  <p className="text-[11px] font-bold text-gray-400 mb-1">ملاحظات العميل:</p>
                                  <p className="text-xs italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg">
                                    "{order.customer.notes}"
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Order items */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                              <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-bold text-gray-500">
                                المنتجات المطلوبة ({order.items?.length || 0})
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 text-xs">
                                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-400">الكمية: {item.quantity} • السعر: LE {item.price}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white shrink-0">
                                      LE {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 flex justify-between items-center text-xs font-bold border-t border-gray-100 dark:border-zinc-800">
                                <span className="text-gray-500">إجمالي الطلب مع التوصيل:</span>
                                <span className="text-emerald-600 text-sm">LE {order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">لا توجد طلبات تطابق معايير البحث</p>
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

