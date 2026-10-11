import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  Cpu, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Compass, 
  Layers 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect unauthenticated or non-admin visitors to /admin/login
  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user?.uid, isAdmin, loading, navigate]);

  // Set noindex meta tag dynamically
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');

    return () => {
      meta?.setAttribute('content', 'all');
    };
  }, []);

  if (loading || !user || !isAdmin) {
    return null; // Silent redirection without flashing
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', end: true, icon: LayoutDashboard },
    { label: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
    { label: 'Resources', path: '/admin/resources', icon: BookOpen },
    { label: 'Learning Paths', path: '/admin/learning-paths', icon: Compass },
    { label: 'Lab Projects', path: '/admin/projects', icon: Cpu },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Students Roster', path: '/admin/students', icon: Users },
    { label: 'Settings & Config', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-orange-100 sticky top-0 z-50 shadow-xs">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/ece-logo.png" 
            alt="ECE Hub Logo" 
            className="h-12 sm:h-14 w-auto object-contain" 
          />
          <span className="text-[10px] font-mono text-orange-600 uppercase tracking-wider font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            ADMIN
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop / Drawer for Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-orange-100 p-5 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 shadow-xs
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Admin Header */}
          <div className="pb-5 mb-4 border-b border-stone-100">
            <Link to="/" className="block mb-2.5">
              <img 
                src="/ece-logo.png" 
                alt="ECE Hub Logo" 
                className="h-16 w-auto object-contain" 
              />
            </Link>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-orange-600 uppercase tracking-wider font-semibold">Admin Console</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-100 text-orange-700 font-mono font-bold">SYS_ROOT</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-stone-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer in Admin Sidebar */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <NavLink
            to="/"
            className="w-full py-2 px-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            ← View Student Portal
          </NavLink>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Admin: {user.displayName || 'Authorized Administrator'}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-2 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full overflow-y-auto bg-[#fafaf9]">
        <Outlet />
      </main>

    </div>
  );
};
