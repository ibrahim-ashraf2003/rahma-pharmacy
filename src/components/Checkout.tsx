import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { CustomerInfo } from '../types';
import { ChevronRight, ShoppingBag, CheckCircle2, AlertCircle, ChevronDown, CreditCard, Banknote, Tag, Loader2 } from 'lucide-react';
import { createOrder, createPaymobOrder, validateCoupon } from '../lib/api';

interface CheckoutProps {
  onBack: () => void;
}

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية',
  'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط',
  'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج'
];

const SHIPPING_FEE = 50;

import { toast } from '../lib/toast';

export default function Checkout({ onBack }: CheckoutProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    governorate: '',
    address: '',
    notes: ''
  });

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    let finalValue = value;
    if (field === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 11);
    }
    setCustomerInfo(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim(), totalPrice);
      setCouponDiscount(result.discount);
      setCouponApplied(true);
      toast.success('Coupon applied / تم تطبيق الكود');
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon / كود غير صحيح');
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  const finalTotal = totalPrice - couponDiscount + SHIPPING_FEE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation logic... (kept same but adding toast)
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    const trimmedName = customerInfo.name.trim();
    const trimmedPhone = customerInfo.phone.trim();
    const trimmedAddress = customerInfo.address.trim();
    const governorate = customerInfo.governorate;

    if (trimmedName.length === 0) newErrors.name = 'الاسم الثنائي مطلوب';
    if (trimmedPhone.length === 0) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (trimmedPhone.length !== 11) {
      newErrors.phone = 'رقم الهاتف يجب أن يكون 11 رقمًا';
    } else if (!/^(010|011|012|015)/.test(trimmedPhone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015';
    }
    if (!governorate) newErrors.governorate = 'المحافظة مطلوبة';
    if (trimmedAddress.length === 0) newErrors.address = 'عنوان الشحن بالتفصيل مطلوب';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix errors / يرجى تصحيح الأخطاء');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: trimmedName,
          phone: trimmedPhone,
          email: customerInfo.email?.trim() || '',
          governorate,
          address: trimmedAddress,
          notes: customerInfo.notes?.trim() || '',
        },
        items: cart.map(item => ({
          productId: (item._id || item.id)!,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
        })),
        paymentMethod,
        ...(couponApplied && couponCode ? { couponCode: couponCode.trim() } : {}),
      };

      const data = await createOrder(orderPayload);
      const createdOrder = data.order;

      if (paymentMethod === 'card') {
        try {
          const paymobData = await createPaymobOrder(createdOrder._id, {
            first_name: trimmedName.split(' ')[0],
            last_name: trimmedName.split(' ').slice(1).join(' ') || 'NA',
            email: customerInfo.email || 'customer@tammi.com',
            phone_number: trimmedPhone,
            street: trimmedAddress,
            city: governorate,
            state: governorate,
          });

          clearCart();
          toast.success('Redirecting to payment... / جاري التحويل للدفع');
          window.location.href = paymobData.iframeUrl;
          return;
        } catch (paymobErr: any) {
          toast.error('Electronic payment failed, order saved as COD / فشل الدفع الإلكتروني، تم حفظ الطلب كدفع عند الاستلام');
        }
      }

      setOrderNumber(createdOrder.orderNumber || createdOrder._id?.slice(-8));
      setIsSuccess(true);
      toast.success('Order placed successfully / تم طلبك بنجاح');
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error(error.message || 'Order failed / فشل تنفيذ الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8" dir="rtl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">تم استلام طلبك بنجاح!</h2>
        {orderNumber && (
          <div className="bg-gray-100 px-6 py-3 rounded-xl mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">رقم الطلب</p>
            <p className="text-2xl font-black font-mono">{orderNumber}</p>
          </div>
        )}
        <p className="text-gray-500 max-w-md mb-8">
          شكراً لتسوقك معنا. سنقوم بالتواصل معك قريباً لتأكيد الطلب وتفاصيل التوصيل.
        </p>
        <button
          onClick={onBack}
          className="bg-black text-white px-12 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-all"
        >
          العودة للمتجر
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-8">
        <button onClick={onBack} className="hover:text-black transition-colors">المتجر</button>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <span className="text-black font-bold">إتمام الطلب</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Checkout Form */}
        <div>
          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">بيانات الشحن</h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">الاسم *</label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full bg-surface-container px-6 py-4 rounded-xl border-2 transition-all outline-none ${
                  errors.name ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-black'
                }`}
                placeholder="أدخل اسمك الثنائي"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  maxLength={11}
                  className={`w-full bg-surface-container px-6 py-4 rounded-xl border-2 transition-all outline-none ${
                    errors.phone ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-black'
                  }`}
                  placeholder="01xxxxxxxxx"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">المحافظة *</label>
                <div className="relative">
                  <select
                    name="governorate"
                    value={customerInfo.governorate}
                    onChange={(e) => handleInputChange('governorate', e.target.value)}
                    className={`w-full appearance-none bg-surface-container px-6 py-4 rounded-xl border-2 transition-all outline-none cursor-pointer ${
                      errors.governorate ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-black'
                    }`}
                    required
                  >
                    <option value="" disabled>اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.governorate && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.governorate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-surface-container px-6 py-4 rounded-xl border-2 border-transparent focus:border-black transition-all outline-none"
                  placeholder="example@mail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">العنوان بالتفصيل *</label>
                <textarea
                  name="address"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full bg-surface-container px-6 py-4 rounded-xl border-2 transition-all outline-none min-h-[56px] md:min-h-[60px] resize-none ${
                    errors.address ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-black'
                  }`}
                  placeholder="أدخل العنوان بالتفصيل"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">ملاحظات إضافية (اختياري)</label>
              <textarea
                name="notes"
                value={customerInfo.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full bg-surface-container px-6 py-4 rounded-xl border-2 border-transparent focus:border-black transition-all outline-none min-h-[100px] resize-none"
                placeholder="أي تعليمات خاصة بالتوصيل..."
              />
            </div>

            {/* Payment Method Selection */}
            <div className="pt-4">
              <h3 className="text-lg font-black mb-4 uppercase tracking-tighter">طريقة الدفع</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-black bg-black/5'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-black' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-black" />}
                  </div>
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div className="text-right">
                    <p className="font-bold text-sm">الدفع عند الاستلام</p>
                    <p className="text-xs text-gray-400">Cash on Delivery</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-black bg-black/5'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-black' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-black" />}
                  </div>
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-right">
                    <p className="font-bold text-sm">بطاقة ائتمان / فيزا</p>
                    <p className="text-xs text-gray-400">Online Payment (Paymob)</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-black text-white py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري تنفيذ الطلب...
                </>
              ) : paymentMethod === 'card' ? (
                'ادفع الآن'
              ) : (
                'تأكيد الطلب'
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              ملخص الطلب
            </h2>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto hide-scrollbar">
              {cart.map((item, index) => (
                <div key={`${item._id || item.id}-${index}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-400">الكمية: {item.quantity}</p>
                    {item.selectedSize && <p className="text-xs text-gray-400">المقاس: {item.selectedSize}</p>}
                    <p className="font-bold text-sm mt-1 font-sans">{(item.price * item.quantity).toLocaleString()} EGP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="كود الخصم"
                  disabled={couponApplied}
                  className="flex-1 bg-surface-container px-4 py-3 rounded-xl text-sm outline-none border-2 border-transparent focus:border-black"
                />
                {couponApplied ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase"
                  >
                    إزالة
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50 flex items-center gap-2"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                    تطبيق
                  </button>
                )}
              </div>
              {couponApplied && (
                <p className="text-green-600 text-xs mt-2 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> تم تطبيق كود الخصم! خصم {couponDiscount.toLocaleString()} EGP
                </p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 font-sans">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-headline">المجموع الفرعي</span>
                <span className="font-bold">{totalPrice.toLocaleString()} EGP</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-headline">الخصم</span>
                  <span className="font-bold">- {couponDiscount.toLocaleString()} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-headline">مصاريف الشحن</span>
                <span className="font-bold">{SHIPPING_FEE.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-xl pt-4 border-t border-gray-100">
                <span className="font-black uppercase tracking-tighter font-headline">الإجمالي</span>
                <span className="font-black">{finalTotal.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
