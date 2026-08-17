import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Order } from '../../../types';

interface Props { orders: Order[]; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RevenueChart({ orders }: Props) {
  const data = useMemo(() => {
    const map: Record<number, number> = {};
    orders.forEach(o => {
      const m = new Date(o.createdAt).getMonth();
      map[m] = (map[m] || 0) + o.total;
    });
    return MONTHS.map((name, i) => ({ name, revenue: map[i] || 0 }));
  }, [orders]);

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const currentMonth = new Date().getMonth();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} width={55}
          tickFormatter={v => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
        <Tooltip
          contentStyle={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}
          formatter={(v: number) => [`LE ${v.toLocaleString()}`, 'Revenue']}
        />
        <Bar dataKey="revenue" radius={[5, 5, 0, 0]} animationDuration={900}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === currentMonth ? 'var(--adm-red)' : 'var(--adm-blue-bg)'}
              stroke={index === currentMonth ? 'var(--adm-red)' : 'var(--adm-blue)'}
              strokeWidth={index === currentMonth ? 0 : 1}
              opacity={index > currentMonth ? 0.3 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
