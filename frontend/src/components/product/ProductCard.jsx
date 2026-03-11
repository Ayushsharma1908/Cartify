import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product._id);
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-shadow hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          <img
            src={product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = `https://via.placeholder.com/300x300?text=Product`; }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Out of stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200"
          >
            {inWishlist
              ? <HiHeart className="text-red-500" size={18} />
              : <FiHeart className="text-slate-500" size={16} />
            }
          </button>

          {/* Quick add to cart */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 inset-x-3 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg"
            >
              <FiShoppingCart size={14} /> Add to Cart
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.ratings > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                <FiStar size={10} />
                <span>{product.ratings}</span>
              </div>
              <span className="text-xs text-slate-400">({product.numReviews?.toLocaleString()})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="text-sm price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-500 font-medium mt-1">Only {product.stock} left!</p>
          )}
        </div>
      </div>
    </Link>
  );
}
