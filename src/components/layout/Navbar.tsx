import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogIn, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, cart, logout, login } = useAuth();
  const location = useLocation();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Lab Projects', path: '/projects' },
    { label: 'Skills & Radar', path: '/skills' },
    { label: 'Parts Tracker', path: '/components' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 py-1 select-none" aria-label="Home">
          <img 
            src="/ece-logo.png" 
            alt="ECE Hub Logo" 
            className="h-14 sm:h-16 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-orange-600 bg-orange-50 border border-orange-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Cart Icon */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            className="relative p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-mono shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-sm font-medium text-slate-800 hover:border-orange-300 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-mono font-bold">
                  {(profile?.displayName || user.displayName || 'S')[0].toUpperCase()}
                </div>
                <span className="truncate max-w-[100px] font-semibold">{profile?.displayName?.split(' ')[0] || 'Dashboard'}</span>
              </Link>
              
              <Link
                to="/profile"
                aria-label="Student Profile"
                className="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors sm:hidden"
              >
                <UserIcon className="w-5 h-5" />
              </Link>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
