import React from 'react';

const BRANDS = [
  { name: 'Dove', src: '/brands/dove.svg' },
  { name: 'Sunsilk', src: '/brands/sunsilk.svg' },
  { name: 'Garnier', src: '/brands/garnier.svg' },
  { name: 'Vaseline', src: '/brands/vaseline.svg' },
  { name: 'Rexona', src: '/brands/rexona.svg' },
  { name: 'LUX', src: '/brands/lux.svg' },
  { name: 'BOBAI', src: '/brands/bobai.svg' },
  { name: 'Infinity', src: '/brands/infinity.svg' },
  { name: 'Natural Leaf', src: '/brands/natural-care.svg' },
  { name: 'StarVille', src: '/brands/starville.svg' },
  { name: 'Dabur Amla', src: '/brands/dabur-amla.svg' },
  { name: 'Sensodyne', src: '/brands/sensodyne.svg' },
  { name: 'Head & Shoulders', src: '/brands/head-shoulders.svg' },
  { name: 'Pantene', src: '/brands/pantene.svg' },
  { name: 'Johnson & Johnson', src: '/brands/johnson.svg' },
  { name: "L'Oreal", src: '/brands/loreal.svg' },
  { name: 'Clear', src: '/brands/clear.svg' },
  { name: 'Signal', src: '/brands/signal.svg' },
  { name: 'Nivea', src: '/brands/nivea.svg' },
  { name: 'Frida', src: '/brands/frida.svg' },
  { name: 'My Way', src: '/brands/my-way.svg' },
  { name: 'Eva Skin Care', src: '/brands/eva-skin-care.svg' },
  { name: 'Aloe Eva', src: '/brands/aloe-eva.svg' },
  { name: 'Eva Hair Clinic Curls', src: '/brands/eva-curls.svg' },
  { name: 'Eva Hair Clinic Keratin', src: '/brands/eva-keratin.svg' },
  { name: 'Eva Skin Clinic Acne-Prone', src: '/brands/eva-acne-prone.svg' },
  { name: 'Eva Skin Clinic Face Serum', src: '/brands/eva-face-serum.svg' },
  { name: 'Eva Foot Powder', src: '/brands/eva-foot-powder.svg' },
  { name: 'Eva Smokers Tooth Powder', src: '/brands/eva-smokers.svg' },
  { name: 'Eva Cover Roots', src: '/brands/eva-cover-roots.svg' },
  { name: 'Eva Senses', src: '/brands/eva-senses.svg' },
  { name: 'Eva Honey', src: '/brands/eva-honey.svg' },
  { name: 'Eva Bébé', src: '/brands/eva-bebe.svg' },
  { name: 'Man Look', src: '/brands/man-look.svg' },
  { name: 'Natural Glow', src: '/brands/natural-glow.svg' },
  { name: 'Gold Argan', src: '/brands/gold-argan.svg' },
  { name: 'Jolieva', src: '/brands/jolieva.svg' },
  { name: 'One', src: '/brands/one.svg' },
  { name: 'Spotless', src: '/brands/spotless.svg' },
  { name: 'Sun & Sea', src: '/brands/sun-sea.svg' },
  { name: 'Fluoro', src: '/brands/fluoro.svg' },
];

export default function BrandTicker() {
  // Seamless loop with 2 duplicate arrays
  const tickerBrands = [...BRANDS, ...BRANDS];

  return (
    <div className="w-full bg-[#f8f9fa] border-y border-black/5 py-10 md:py-12 overflow-hidden select-none relative group" dir="ltr">
      {/* Side Fade Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 pointer-events-none" />

      {/* Infinite Moving Marquee of Brand Logos in Natural Colors & Large Size */}
      <div className="flex w-max animate-infinite-marquee hover:[animation-play-state:paused] items-center">
        {tickerBrands.map((brand, idx) => (
          <div 
            key={`${brand.name}-${idx}`} 
            className="px-8 md:px-12 flex items-center justify-center shrink-0"
          >
            <img 
              src={brand.src} 
              alt={brand.name} 
              className="h-14 md:h-20 w-auto max-w-[180px] md:max-w-[240px] object-contain transition-all duration-300 transform hover:scale-110 cursor-pointer drop-shadow-xs"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
