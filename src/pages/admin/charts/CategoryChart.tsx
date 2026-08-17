import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order } from '../../../types';

interface Props { orders: Order[]; }

const COLORS = ['var(--adm-red)', 'var(--adm-blue)', 'var(--adm-green)', 'var(--adm-orange)', 'var(--adm-purple)', '#06b6d4', '#f43f5e'];

export default function CategoryChart({ orders }: Props) {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        // category is not on order items directly, use product name prefix as proxy
        const cat = (item.name || 'Other').split(' ')[0];
        map[cat] = (map[cat] || 0) + item.price * item.quantity;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--adm-text-muted)', padding: 32, fontSize: 13 }}>
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          animationDuration={800}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [`LE ${v.toLocaleString()}`, 'Revenue']}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
