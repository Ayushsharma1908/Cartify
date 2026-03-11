import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import Spinner from '../components/common/Skeleton';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is waiting</h2>
          <p className="text-slate-500 mb-6">Please login to view your cart</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const savings = items.reduce((sum, item) => {
    const orig = item.product?.originalPrice || item.price;
    return sum + (orig - item.price) * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-7xl mb-5">🛒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything yet</p>
          <Link to="/products" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">
          Shopping Cart <span className="text-base font-normal text-slate-500">({items.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity, price }) => (
              <div key={product._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card flex gap-4">
                <Link to={`/products/${product._id}`} className="shrink-0">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-xl bg-slate-50 hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateItem(product._id, quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-colors"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateItem(product._id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-colors"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatPrice(price * quantity)}</p>
                      {quantity > 1 && (
                        <p className="text-xs text-slate-400">{formatPrice(price)} each</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(product._id)}
                  className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-start"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {savings > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                <p className="text-green-700 font-semibold text-sm">
                  🎉 You save {formatPrice(savings)} on this order!
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
              <h2 className="font-display font-bold text-slate-900 text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium text-slate-800">{formatPrice(tax)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between text-slate-900 font-bold text-base">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-xl p-3 mb-4">
                  Add {formatPrice(499 - subtotal)} more for free delivery
                </p>
              )}

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <Link
                to="/products"
                className="w-full mt-3 border border-slate-200 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
