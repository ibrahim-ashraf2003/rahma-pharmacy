// Same-origin: frontend and API are both on Vercel
const BASE_URL = '';

const getAuthToken = () => localStorage.getItem('tammi_token');

const headers = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleRes = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
};

// ─── Admin Auth ───
export const login = async (email: string, password: string) => {
  const data = await handleRes(
    await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password }),
    })
  );
  localStorage.setItem('tammi_token', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('tammi_token');
};

export const isAuthenticated = () => !!localStorage.getItem('tammi_token');

// ─── Generic fetch helper ───
export const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: headers(),
    ...options,
  });
  return handleRes(res);
};

// ─── Products ───
export const getProducts = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/products${qs ? `?${qs}` : ''}`);
};

export const getProduct = (id: string) => apiFetch(`/api/products/${id}`);

export const createProduct = (data: any) =>
  apiFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (id: string, data: any) =>
  apiFetch(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: string) =>
  apiFetch(`/api/products/${id}`, { method: 'DELETE' });

// ─── Orders ───
export const getOrders = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/orders${qs ? `?${qs}` : ''}`);
};

export const createOrder = (data: any) =>
  apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateOrderStatus = (id: string, orderStatus: string) =>
  apiFetch(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ orderStatus }),
  });

// ─── Paymob ───
export const createPaymobOrder = (orderId: string, billingData?: any) =>
  apiFetch('/api/paymob/create-order', {
    method: 'POST',
    body: JSON.stringify({ orderId, billingData }),
  });

// ─── Image Upload ───
export const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/api/uploads/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do not set Content-Type for FormData, browser will do it with boundary
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Upload failed');
  }
  return data;
};

// ─── Coupons ───
export const getCoupons = () => apiFetch('/api/coupons');

export const createCoupon = (data: any) =>
  apiFetch('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCoupon = (id: string, data: any) =>
  apiFetch(`/api/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteCoupon = (id: string) =>
  apiFetch(`/api/coupons/${id}`, { method: 'DELETE' });

export const validateCoupon = (code: string, subtotal: number) =>
  apiFetch('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });

// ─── Reviews ───
export const getReviews = () => apiFetch('/api/reviews');

export const getApprovedReviews = (productId: string) => apiFetch(`/api/reviews/${productId}`);

export const createReview = (data: any) =>
  apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateReview = (id: string, data: any) =>
  apiFetch(`/api/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteReview = (id: string) =>
  apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });

// ─── Customer Auth ───
let customerToken = localStorage.getItem('tammi_customer_token') || null;

export const customerRegister = async (data: { name: string; email: string; phone: string; password: string }) => {
  const result = await apiFetch('/api/customers/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  customerToken = result.token;
  localStorage.setItem('tammi_customer_token', result.token);
  return result;
};

export const customerLogin = async (email: string, password: string) => {
  const result = await apiFetch('/api/customers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  customerToken = result.token;
  localStorage.setItem('tammi_customer_token', result.token);
  return result;
};

export const customerLogout = () => {
  customerToken = null;
  localStorage.removeItem('tammi_customer_token');
};

export const isCustomerAuthenticated = () => !!localStorage.getItem('tammi_customer_token');
