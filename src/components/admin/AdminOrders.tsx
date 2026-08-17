import { useEffect, useState } from 'react';
import { ShoppingBag, User, Phone, MapPin, Calendar, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Order } from '../../types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/api/orders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const data = await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: status }),
      });

      if (data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: status as any });
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <PackageCheck className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading orders...</div>;

  return (
    <div>
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tighter">Orders</h1>
        <p className="text-gray-500 mt-2">Manage customer orders and fulfillment</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Orders List */}
        <div className="flex-1 space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className={`bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                selectedOrder?._id === order._id ? 'border-black ring-1 ring-black' : 'border-gray-100'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{order.customer.name}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{order.customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-black tracking-tighter">LE {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="lg:w-[450px]">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tighter">Order Details</h2>
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(selectedOrder.orderStatus)}`}>
                  {getStatusIcon(selectedOrder.orderStatus)}
                  {selectedOrder.orderStatus}
                </div>
              </div>

              <div className="space-y-8">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Customer Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>{selectedOrder.customer.address}, {selectedOrder.customer.governorate}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Order Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h5 className="text-sm font-bold">{item.name}</h5>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} × LE {item.priceValue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-bold">LE {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="font-bold">LE {selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2">
                    <span className="font-black uppercase tracking-tighter">Total</span>
                    <span className="font-black tracking-tighter">LE {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Update Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder._id, status)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          selectedOrder.orderStatus === status 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="font-headline text-xl font-black uppercase tracking-tighter mb-2">No Order Selected</h3>
              <p className="text-gray-400 text-sm">Select an order from the list to view full details and update status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
