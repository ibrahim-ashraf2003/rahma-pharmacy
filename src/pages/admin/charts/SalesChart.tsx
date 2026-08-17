import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Order } from '../../../types';

interface Props { orders: Order[]; }

export default function SalesChart({ orders }: Props) {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      map[key] = (map[key] || 0) + o.total;
    });

    // Last 14 days
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      result.push({ day: key, revenue: map[key] || 0 });
    }
    return result;
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--adm-red)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--adm-red)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--adm-text-muted)' }} tickLine={false} axisLine={false} width={50}
          tickFormatter={v => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
        <Tooltip
          contentStyle={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}
          formatter={(v: number) => [`LE ${v.toLocaleString()}`, 'Revenue']}
        />
        <Area
          type="monotone" dataKey="revenue"
          stroke="var(--adm-red)" strokeWidth={2}
          fill="url(#salesGrad)"
          dot={false} activeDot={{ r: 4, fill: 'var(--adm-red)' }}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
