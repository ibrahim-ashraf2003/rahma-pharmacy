import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';
import Checkout from './components/Checkout';
import Shop from './components/Shop';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import ProductDetail from './pages/ProductDetail';

import { useCart } from './context/CartContext';

import Toaster from './components/ui/Toaster';
import SEO from './components/SEO';

import PaymentStatus from './pages/PaymentStatus';
import { TermsOfService, PrivacyPolicy } from './pages/Legal';
import NotFound from './pages/NotFound';

export default function App() {
  const { view, setView } = useCart();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface selection:bg-tertiary selection:text-white">
        <Toaster />
          
          <SEO 
            title="Professional Activewear" 
            description="Discover premium Egyptian sportswear for men. Quality, comfort, and style by Tammi Sports. | اكتشف أفضل الملابس الرياضية المصرية للرجال"
          />
        
        {/* Header يظهر بس في الموقع مش الادمن */}
        {!isAdminRoute && <Header />}
        
        <main>
          <Routes>

            {/* Public */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/"
              element={
                view === 'checkout' ? (
                  <Checkout onBack={() => setView('shop')} />
                ) : (
                  <Shop />
                )
              }
            />

            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

          </Routes>
        </main>

        {/* Footer يظهر بس في الموقع مش الادمن */}
        {!isAdminRoute && (
          <>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
            <BottomNav />
          </>
        )}
        </div>
      </AuthProvider>
  );
}