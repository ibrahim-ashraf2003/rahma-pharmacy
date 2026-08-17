import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [orderNo, setOrderNo] = useState<string>('');

  useEffect(() => {
    // Paymob redirects here with query params: success=true/false & merchant_order_id=...
    const success = searchParams.get('success');
    const orderId = searchParams.get('merchant_order_id');

    if (orderId) setOrderNo(orderId);

    if (success === 'true') {
      setStatus('success');
    } else if (success === 'false') {
      setStatus('failure');
    } else {
      // If accessed without valid params, redirect home after a short delay
      setTimeout(() => navigate('/'), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 pt-24 pb-32">
      <SEO title={status === 'success' ? 'Payment Successful' : 'Payment Failed'} />
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Verifying Payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Payment Successful!
            </h1>
            <p className="text-gray-500">
              Thank you for your purchase. Your order <strong className="text-black">#{orderNo}</strong> has been confirmed and is being processed.
              <br />
              شكرًا لشرائك. تم تأكيد طلبك وجاري تجهيزه.
            </p>
            <Link
              to="/"
              className="mt-4 w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest hover:bg-tertiary transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        )}

        {status === 'failure' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Payment Failed
            </h1>
            <p className="text-gray-500">
              Unfortunately, we could not process your payment for order <strong className="text-black">#{orderNo}</strong>. Please try again or use a different payment method.
              <br />
              للأسف، لم نتمكن من معالجة الدفع لطلبك. يرجى المحاولة مرة أخرى.
            </p>
            <Link
              to="/"
              className="mt-4 w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest hover:bg-tertiary transition-colors"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
