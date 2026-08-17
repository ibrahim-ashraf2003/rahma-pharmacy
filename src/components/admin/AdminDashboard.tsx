import { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersData, productsData] = await Promise.all([
          apiFetch('/api/orders'),
          apiFetch('/api/products'),
        ]);

        if (ordersData.success && productsData.success) {
          const totalRevenue = ordersData.orders.reduce((acc: number, order: any) => acc + order.total, 0);
          setStats({
            orders: ordersData.orders.length,
            products: productsData.products.length,
            totalRevenue,
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading stats...</div>;
  }

  const cards = [
    { name: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'Total Products', value: stats.products, icon: Package, color: 'bg-purple-500' },
    { name: 'Total Revenue', value: `LE ${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tighter">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of your store's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${card.color} flex items-center justify-center text-white`}>
              <card.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{card.name}</p>
              <p className="text-3xl font-black tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tighter mb-6">Recent Activity</h2>
        <p className="text-gray-500 italic">More detailed charts and activity logs coming soon...</p>
      </div>
    </div>
  );
}
