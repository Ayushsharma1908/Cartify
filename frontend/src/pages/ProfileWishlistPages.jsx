import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { HiTrash } from 'react-icons/hi';
import { useAuthStore, useWishlistStore, useCartStore } from '../store';


const formatPrice = (p) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

// ─── Profile Page ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [isAuthenticated, user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile(form);
    if (result.success) setEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">My Profile</h1>

        {/* Avatar section */}
        <div className="bg-white rounded-3xl shadow-card p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <FiSave size={15} /> Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <FiX size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { icon: FiUser, label: 'Name', value: user?.name },
                { icon: FiMail, label: 'Email', value: user?.email },
                { icon: FiPhone, label: 'Phone', value: user?.phone || 'Not provided' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="font-semibold text-slate-800 text-sm">{value}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setEditing(true)}
                className="w-full border border-blue-200 text-blue-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiEdit2 size={15} /> Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { to: '/orders', icon: '📦', label: 'My Orders', desc: 'Track your orders' },
            { to: '/wishlist', icon: '❤️', label: 'Wishlist', desc: 'Saved items' },
          ].map(({ to, icon, label, desc }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-bold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { wishlist, fetchWishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchWishlist();
  }, [isAuthenticated, navigate, fetchWishlist]);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-slate-900">
            My Wishlist <span className="text-base font-normal text-slate-500">({wishlist.length})</span>
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-card">
            <div className="text-7xl mb-5">❤️</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 mb-8">Save items you love to buy them later</p>
            <Link to="/products" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all group">
                <Link to={`/products/${product._id}`}>
                  <div className="aspect-square bg-slate-50 overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">{product.name}</p>
                  </Link>
                  <p className="font-bold text-slate-900 mb-3">{formatPrice(product.price)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product._id, 1)}
                      className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <HiTrash className="text-red-400" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
