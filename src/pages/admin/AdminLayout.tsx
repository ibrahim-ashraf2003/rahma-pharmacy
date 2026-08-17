import { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Package, ShoppingCart, Ticket, Star, LogOut,
  ExternalLink, Bell, Search, Sun, Moon,
  Menu, X, ChevronLeft, ChevronRight, Store, CheckCircle
} from 'lucide-react';
import PharmacyEmblem from '../../components/PharmacySymbol';
import './admin.css';

/* ── Sidebar nav config ─────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'الرئيسية والمبيعات',
    items: [
      { name: 'لوحة التحكم', enName: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'الطلبات والمبيعات', enName: 'Orders',    path: '/admin/orders',    icon: ShoppingCart, badge: 'جديد' },
    ],
  },
  {
    label: 'إدارة المتجر',
    items: [
      { name: 'المنتجات والمخزون', enName: 'Products',   path: '/admin/products',  icon: Package },
      { name: 'كوبونات الخصم', enName: 'Coupons',    path: '/admin/coupons',   icon: Ticket },
      { name: 'آراء وتقييمات العملاء', enName: 'Reviews',   path: '/admin/reviews',   icon: Star },
    ],
  },
];

/* ── Inner layout (needs ThemeProvider already mounted) ── */
function AdminLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    if (!authed) navigate('/admin/login');
  }, [authed, navigate]);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  if (!authed) return null;

  const sidebarLeft = collapsed
    ? 'var(--adm-sidebar-collapsed)'
    : 'var(--adm-sidebar-width)';

  const notifications = [
    { id: 1, icon: ShoppingCart, color: 'var(--adm-blue)',   bg: 'var(--adm-blue-bg)',   text: 'طلب جديد #EVA-000103 من هدير مصطفى',       time: 'منذ 10 دقائق', unread: true },
    { id: 2, icon: CheckCircle,  color: 'var(--adm-green)',  bg: 'var(--adm-green-bg)',  text: 'تم تأكيد شحن طلب #EVA-000101',   time: 'منذ ساعة', unread: true },
    { id: 3, icon: Package,      color: 'var(--adm-orange)', bg: 'var(--adm-orange-bg)', text: 'تنبيه مخزون: لوشن الجسم ان ذا كلاودز (نفد)',   time: 'منذ ساعتين', unread: false },
    { id: 4, icon: Star,         color: 'var(--adm-purple)', bg: 'var(--adm-purple-bg)', text: 'تقييم 5 نجوم جديد من سلمى خالد',       time: 'منذ 3 ساعات', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="adm-root font-sans" dir="rtl">

      {/* ── Overlay (mobile) ── */}
      <div
        className={`adm-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Logo */}
        <div className="adm-sidebar-logo">
          <div className="adm-sidebar-logo-icon" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
            <PharmacyEmblem className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="adm-sidebar-logo-text font-bold">صيدلية الرحمة</span>
            <span className="text-[10px] text-gray-400 font-medium">لوحة تحكم المتجر</span>
          </div>
        </div>

        {/* Store Quick Link */}
        <div className="px-3 pt-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold border border-white/10"
            title={collapsed ? 'زيارة المتجر' : undefined}
          >
            <div className="flex items-center gap-2">
              <Store size={15} className="text-emerald-400" />
              {!collapsed && <span>زيارة المتجر</span>}
            </div>
            {!collapsed && <ExternalLink size={13} className="text-gray-500" />}
          </Link>
        </div>

        {/* Nav */}
        <nav className="adm-sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-4">
              {!collapsed && <div className="adm-nav-section-label font-bold text-[11px] text-gray-400">{section.label}</div>}
              {section.items.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={`adm-nav-item${isActive ? ' active' : ''}`}
                  >
                    <span className="adm-nav-icon"><Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} /></span>
                    <span className="adm-nav-label font-medium">{item.name}</span>
                    {item.badge && !collapsed && (
                      <span className="mr-auto text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="adm-sidebar-footer">
          <button
            className="adm-nav-item hover:bg-red-500/10 transition-colors"
            onClick={handleLogout}
            title={collapsed ? 'تسجيل الخروج' : undefined}
            style={{ color: '#ef4444', marginBottom: 8, width: '100%' }}
          >
            <span className="adm-nav-icon"><LogOut size={17} strokeWidth={1.8} /></span>
            <span className="adm-nav-label font-bold">تسجيل الخروج</span>
          </button>

          <button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'توسيع' : 'طي'}>
            {collapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </aside>

      {/* ── Header ── */}
      <header
        className="adm-header"
        style={{ right: sidebarLeft, left: 0 }}
      >
        <div className="adm-header-left">
          {/* Mobile hamburger */}
          <button className="adm-icon-btn" style={{ display: 'none' }} onClick={() => setMobileOpen(o => !o)} id="adm-hamburger">
            <Menu size={16} />
          </button>

          <div className="adm-search-bar">
            <Search size={14} style={{ color: 'var(--adm-text-muted)', flexShrink: 0 }} />
            <input
              placeholder="البحث في الطلبات والمنتجات..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
        </div>

        <div className="adm-header-right">
          {/* View store button on top bar */}
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
          >
            <Store size={14} />
            <span>عرض المتجر</span>
          </Link>

          {/* Dark mode toggle */}
          <button className="adm-icon-btn" onClick={toggleTheme} title="تبديل المظهر">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button className="adm-icon-btn" onClick={() => setNotifOpen(o => !o)} title="الإشعارات">
              <Bell size={15} />
              {unreadCount > 0 && <span className="adm-badge-dot" />}
            </button>

            {notifOpen && (
              <div className="adm-dropdown" style={{ left: 0, right: 'auto' }}>
                <div className="adm-dropdown-header flex justify-between items-center">
                  <span className="font-bold">الإشعارات والتنبيهات</span>
                  <span className="adm-badge adm-badge-red">{unreadCount} جديد</span>
                </div>
                <div className="adm-dropdown-body">
                  {notifications.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className={`adm-notif-item${n.unread ? ' unread' : ''}`} onClick={() => setNotifOpen(false)}>
                        <div className="adm-notif-icon" style={{ background: n.bg }}>
                          <Icon size={14} style={{ color: n.color }} />
                        </div>
                        <div>
                          <div className="adm-notif-body font-medium text-xs">{n.text}</div>
                          <div className="adm-notif-time text-[10px]">{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="adm-profile-btn flex items-center gap-2">
            <div className="adm-avatar font-bold">ص</div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="adm-profile-name text-xs font-bold">مدير المتجر</span>
              <span className="text-[10px] text-gray-400">صيدلية الرحمة</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        className="adm-main"
        style={{ marginRight: sidebarLeft, marginLeft: 0 }}
        onClick={() => { if (notifOpen) setNotifOpen(false); }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile hamburger CSS override */}
      <style>{`
        @media (max-width: 768px) {
          #adm-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutInner />
    </ThemeProvider>
  );
}

