import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Order } from '../../../types';

interface Props { orders: Order[]; }

export default function TopProductsChart({ orders }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map(d => ({ ...d, name: d.name.length > 18 ? d.name.slice(0, 18) + '…' : d.name }));
  }, [orders]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--adm-text-muted)', padding: 32, fontSize: 13 }}>
        No sales data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false}
          tickFormatter={v => `LE ${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--adm-text-primary)' }} tickLine={false} axisLine={false} width={140} />
        <Tooltip
          contentStyle={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [`LE ${v.toLocaleString()}`, 'Revenue']}
        />
        <Bar dataKey="revenue" fill="var(--adm-red)" radius={[0, 5, 5, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}
