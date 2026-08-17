import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Order } from '../../../types';

interface Props { orders: Order[]; }

export default function OrdersChart({ orders }: Props) {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      map[key] = (map[key] || 0) + 1;
    });
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      result.push({ day: key, orders: map[key] || 0 });
    }
    return result;
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={10} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
        <Tooltip
          contentStyle={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}
          formatter={(v: number) => [v, 'Orders']}
        />
        <Bar dataKey="orders" fill="var(--adm-blue)" radius={[4, 4, 0, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}
