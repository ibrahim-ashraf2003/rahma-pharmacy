export interface Product {
  _id?: string;
  id?: string;
  name: string;
  arabicName?: string;
  englishName?: string;
  brand?: string;
  category: string;
  subCategory?: string;
  description: string;
  shortDescription?: string;
  arabicDescription?: string;
  englishDescription?: string;
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  discount?: number;
  currency?: string;
  image: string;
  images?: string[];
  sizeVolume?: string;
  unit?: string;
  availableVariants?: string[];
  skinType?: string;
  hairType?: string;
  targetConcerns?: string[];
  ingredients?: string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  stock: number;
  badge?: string;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  active?: boolean;
  gender?: 'women' | 'men' | 'unisex' | 'kids';
  sourceWebsite?: string;
  priceSourceUrl?: string;
  imageSourceUrl?: string;
  lastPriceUpdate?: string;
  priceStatus?: 'verified' | 'verification_required' | 'outdated';
  sku?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  governorate: string;
  city?: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  _id?: string;
  orderNumber?: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cash' | 'card';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymobOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
  error?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}
