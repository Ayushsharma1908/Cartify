import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiHeart, FiUser, FiMenu, FiX, FiChevronDown, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';

const CATEGORIES = ['Electronics', 'Fashion', 'Mobiles', 'Home & Furniture', 'Beauty', 'Sports', 'Books', 'Grocery'];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-nav border-b border-slate-100">
      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <HiSparkles className="text-white text-lg" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">
            Car<span className="text-blue-600">tify</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white focus:shadow-md transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <FiHeart className="text-slate-600 group-hover:text-red-500 transition-colors" size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold badge-pulse">
                {wishlist.length > 9 ? '9+' : wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <FiShoppingCart className="text-slate-600 group-hover:text-blue-600 transition-colors" size={20} />
            {cart.totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {cart.totalItems > 9 ? '9+' : cart.totalItems}
              </span>
            )}
          </Link>

          {/* User */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                <FiChevronDown className={`text-slate-400 text-sm transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-dropdown border border-slate-100 py-2 fade-in">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="font-semibold text-slate-800 text-sm">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  {[
                    { to: '/profile', icon: FiUser, label: 'My Profile' },
                    { to: '/orders', icon: FiPackage, label: 'My Orders' },
                    { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
                    ...(user?.role === 'admin' ? [{ to: '/admin', icon: FiSettings, label: 'Admin Panel' }] : [])
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-50 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                    >
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 hover:shadow-md transition-all"
            >
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl hover:bg-slate-50 ml-1">
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden md:block border-t border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-10 text-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="text-slate-600 hover:text-blue-600 font-medium whitespace-nowrap transition-colors relative group"
            >
              {cat}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile search + menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white p-4 space-y-4 shadow-lg fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FiSearch size={16} />
              </button>
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="text-sm text-slate-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
