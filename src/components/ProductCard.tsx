import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  dark?: boolean;
  onQuickView?: (product: Product) => void;
  key?: React.Key | string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isTouched, setIsTouched] = useState(false);
  const isOutOfStock = product.stock === 0;

  // Calculate discount percentage
  const originalPrice = product.originalPrice || (product.oldPrice as number | undefined);
  const hasDiscount = Boolean(originalPrice && originalPrice > product.price);
  const discountPercent = product.discount || (hasDiscount && originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0);

  // Rating out of 5
  const ratingValue = product.rating || product.averageRating || 4.8;
  const reviewsCount = product.reviewCount || product.reviewsCount || 18;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div 
      className="group relative flex flex-col items-center text-center w-full bg-white p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer select-none border border-transparent hover:border-gray-100 hover:shadow-md"
      onClick={() => setIsTouched(!isTouched)}
      onMouseEnter={() => setIsTouched(true)}
      onMouseLeave={() => setIsTouched(false)}
      dir="rtl"
    >
      {/* 1. Product Image Wrapper */}
      <div className="relative w-full aspect-[4/5] flex items-center justify-center overflow-hidden mb-3">
        
        {/* Top-Right Discount Badge in Percentage: "خصم 20%" */}
        {hasDiscount && discountPercent > 0 && (
          <div 
            className="absolute top-1.5 right-1.5 bg-[#d32f2f] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10 pointer-events-none"
            dir="rtl"
          >
            خصم {discountPercent}%
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-1.5 left-1.5 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 pointer-events-none">
            نفدت الكمية
          </div>
        )}

        {/* Product Image - enlarged while preserving the original aspect ratio */}
        <Link 
          to={`/product/${product._id || product.id}`} 
          className="block w-full h-full relative flex items-center justify-center"
        >
          <img 
            className="w-full h-full object-contain scale-[1.15] transition-transform duration-300 group-hover:scale-[1.2]"
            src={product.image} 
            alt={product.arabicName || product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Hover / Touch: "أضف إلى السلة" Button */}
        {!isOutOfStock && (
          <div className={`absolute inset-x-2 bottom-2 z-20 transition-all duration-300 transform ${
            isTouched ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          } group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto`}>
            <button 
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-gray-950 hover:bg-black active:scale-95 text-white py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              aria-label="أضف إلى السلة"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>أضف إلى السلة</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Title (Centered Arabic Text) */}
      <Link 
        to={`/product/${product._id || product.id}`} 
        className="block text-center w-full px-1 group-hover:text-emerald-700 transition-colors"
      >
        <h3 className="font-headline text-xs sm:text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 min-h-[36px] text-center">
          {product.arabicName || product.name}
        </h3>
      </Link>

      {/* 3. Star Rating (5 Stars) */}
      <div className="flex items-center justify-center gap-1.5 my-1" dir="ltr">
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-3 h-3 ${star <= Math.round(ratingValue) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-gray-500 font-sans">
          {ratingValue.toFixed(1)}
        </span>
      </div>

      {/* 4. Price Display: Current price on top + Strikethrough old price underneath */}
      <div className="mt-1.5 flex flex-col items-center justify-center gap-0.5 w-full">
        {/* Main/Current Price */}
        <div className="flex items-baseline justify-center gap-1 font-bold text-sm sm:text-base text-gray-950" dir="rtl">
          <span>{product.price.toLocaleString()}</span>
          <span className="text-xs font-bold text-gray-600">EGP</span>
        </div>

        {/* Strikethrough Old Price Underneath */}
        {hasDiscount && originalPrice && (
          <div className="flex items-baseline justify-center gap-1 text-xs text-gray-400 line-through decoration-red-500 decoration-1.5 font-medium" dir="rtl">
            <span>{originalPrice.toLocaleString()}</span>
            <span className="text-[10px]">EGP</span>
          </div>
        )}
      </div>
    </div>
  );
}
