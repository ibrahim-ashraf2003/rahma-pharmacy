import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems, setView } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <h2 className="text-xl font-bold">سلة التسوق ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium">سلة التسوق فارغة</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-black font-bold border-b-2 border-black pb-1 hover:opacity-70 transition-opacity"
                  >
                    ابدأ التسوق
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id || item.id} className="flex gap-4">
                    <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart((item._id || item.id)!)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-sans">{item.price.toLocaleString()} EGP</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity((item._id || item.id)!, item.quantity - 1)}
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity((item._id || item.id)!, item.quantity + 1)}
                            className="p-1 hover:text-green-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold text-sm font-sans">
                          {(item.price * item.quantity).toLocaleString()} EGP
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-gray-500">الإجمالي</span>
                  <span className="font-black font-sans">{totalPrice.toLocaleString()} EGP</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={clearCart}
                    className="py-4 border border-gray-200 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
                  >
                    مسح السلة
                  </button>
                  <button 
                    onClick={handleCheckout}
                    className="py-4 bg-black text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-colors shadow-lg shadow-black/10"
                  >
                    إتمام الطلب
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
