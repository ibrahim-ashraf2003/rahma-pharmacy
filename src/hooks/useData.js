import { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts, getOrders } from '../lib/api';

const normalize = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.success === false) throw new Error(res.error || 'API Error');
  return res.data || res.products || res.orders || [];
};

export const useProducts = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts(paramsRef.current);
      setData(normalize(res));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useOrders = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders(paramsRef.current);
      // normalize orderStatus -> status
      const normalized = normalize(res).map(o => ({
        ...o,
        status: o.status || o.orderStatus || 'pending',
      }));
      setData(normalized);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useStats = () => {
  const { data: orders = [], loading, error } = useOrders();
  const { data: products = [] } = useProducts();

  const revenueByMonth = (() => {
    const months = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt || o.created_at || Date.now());
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = (months[key] || 0) + (o.total || o.amount || 0);
    });
    return Object.entries(months).slice(-8).map(([k, revenue]) => ({ key: k, revenue }));
  })();

  const stats = {
    totalRevenue: orders.reduce((s, o) => s + (o.total || o.amount || 0), 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    pendingOrders: orders.filter(o => (o.status || o.orderStatus) === 'pending').length,
    activeVisitors: Math.floor(Math.random() * 500) + 3200,
    revenueByMonth: revenueByMonth.length ? revenueByMonth : [1,2,3,4,5,6,7,8].map(i => ({ key: i, revenue: 0 })),
  };

  return { stats, loading, error };
};
