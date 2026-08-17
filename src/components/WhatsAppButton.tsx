import React from 'react';

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open('https://wa.me/201094349118', '_blank');
  };

  return (
    <div className="fixed bottom-20 md:bottom-24 right-6 z-50">
      <button
        onClick={handleClick}
        className="w-16 h-16 md:w-18 md:h-18 block p-0 border-none bg-transparent cursor-pointer transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none"
        aria-label="تواصل معنا عبر واتساب - WhatsApp Contact"
      >
        <img
          src="/whatsapp-icon.svg"
          alt="WhatsApp"
          className="w-full h-full object-contain pointer-events-none select-none"
          loading="eager"
        />
      </button>
    </div>
  );
}
