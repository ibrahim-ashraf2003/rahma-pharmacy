import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Instagram, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-[#fcfcfc] text-black border-t border-black/5 font-sans pb-28 md:pb-20" dir="ltr">
      <div className="container mx-auto px-6 md:px-12 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & Newsletter Signup */}
          <div className="flex flex-col items-center md:items-start max-w-sm mx-auto md:mx-0 order-first lg:order-none">
            <div className="mb-6">
              <Logo className="h-12 w-auto" />
            </div>
            <h4 className="font-headline text-lg font-black tracking-widest mb-2 uppercase">النشرة البريدية</h4>
            <p className="text-gray-500 text-xs md:text-sm mb-6 text-center md:text-left leading-relaxed">
              اشترك في نشرة صيدلية الرحمة للحصول على أحدث العروض والمنتجات الطبية الحصرية.
            </p>
            <div className="relative w-full">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white border border-black/5 rounded-full py-4 px-7 pr-32 text-xs focus:outline-none focus:ring-1 focus:ring-black transition-all text-left placeholder:text-gray-400 shadow-sm"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-black text-white px-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                Join
              </button>
            </div>
          </div>

          {/* Information (Accordion on Mobile) */}
          <div className="border-b md:border-none border-black/5 py-4 md:py-0">
            <button 
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between md:cursor-default"
            >
              <h4 className="font-headline text-lg font-black tracking-widest uppercase md:mb-8 text-black">Info</h4>
              <div className="md:hidden">
                {openSection === 'info' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            <ul className={`mt-6 md:mt-0 space-y-4 text-[13px] font-bold uppercase tracking-widest text-gray-400 transition-all ${openSection === 'info' ? 'block' : 'hidden md:block'}`}>
              <li><Link to="/" className="hover:text-black transition-colors block py-2 md:py-0">Home</Link></li>
              <li><Link to="/terms" className="hover:text-black transition-colors block py-2 md:py-0">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors block py-2 md:py-0">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-black transition-colors block py-2 md:py-0">Size Guide</a></li>
              <li><a href="mailto:tammiii.eg@gmail.com" className="hover:text-black transition-colors block py-2 md:py-0">Contact Us</a></li>
            </ul>
          </div>

          {/* Categories (Accordion on Mobile) */}
          <div className="border-b md:border-none border-black/5 py-4 md:py-0">
             <button 
              onClick={() => toggleSection('cats')}
              className="w-full flex items-center justify-between md:cursor-default"
            >
              <h4 className="font-headline text-lg font-black tracking-widest uppercase md:mb-8 text-black">Shop</h4>
              <div className="md:hidden">
                {openSection === 'cats' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            <ul className={`mt-6 md:mt-0 space-y-4 text-[13px] font-bold uppercase tracking-widest text-gray-400 transition-all ${openSection === 'cats' ? 'block' : 'hidden md:block'}`}>
              <li><a href="#" className="hover:text-black transition-colors block py-2 md:py-0">Men</a></li>
              <li><a href="#" className="hover:text-black transition-colors block py-2 md:py-0">Kids</a></li>
              <li><a href="#" className="hover:text-black transition-colors block py-2 md:py-0">Accessories</a></li>
            </ul>
          </div>

          {/* Contact Card & Socials */}
          <div className="flex flex-col items-center lg:items-start gap-8">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-6 text-left border border-black/5 shadow-xl shadow-black/5">
              <div className="flex items-start gap-4 text-xs font-bold tracking-wider text-gray-600">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-black" />
                </div>
                <span className="flex-1 leading-relaxed">Biyala City, Kafr El Sheikh, Egypt</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold tracking-wider text-gray-600">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <a href="mailto:tammiii.eg@gmail.com" className="hover:text-black transition-colors flex-1">tammiii.eg@gmail.com</a>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold tracking-wider text-gray-600">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-black" />
                </div>
                <a href="tel:01094349118" className="hover:text-black transition-colors flex-1 font-sans" dir="ltr">01094349118</a>
              </div>
            </div>

            {/* Circular Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: <Facebook className="w-5 h-5" />, href: "https://www.facebook.com/profile.php?id=61582265018723" },
                { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/tammi.eg" },
                { icon: <MessageCircle className="w-5 h-5" />, href: "https://wa.me/201094349118" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 bg-white border border-black/5 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm group active:scale-95"
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          <p>© 2026 صيدلية الرحمة. جميع الحقوق محفوظة.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

