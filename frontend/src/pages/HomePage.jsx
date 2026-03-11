import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import * as api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';

const CATEGORY_DATA = [
  { name: 'Mobiles', emoji: '📱', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { name: 'Electronics', emoji: '💻', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
  { name: 'Fashion', emoji: '👗', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50' },
  { name: 'Home & Furniture', emoji: '🛋️', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
  { name: 'Beauty', emoji: '💄', color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
  { name: 'Sports', emoji: '⚽', color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  { name: 'Books', emoji: '📚', color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50' },
  { name: 'Grocery', emoji: '🛒', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
];

const FEATURES = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹499', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: FiShield, title: 'Secure Payment', desc: 'Stripe-powered checkout', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: FiShoppingBag, title: '10M+ Products', desc: 'Across all categories', color: 'text-violet-600', bg: 'bg-violet-50' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ sort: 'newest', limit: 8 })
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400 rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <HiSparkles className="text-yellow-300" />
            <span>New arrivals every day</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-5 leading-tight">
            Shop Everything,<br />
            <span className="text-cyan-300">Delivered Fast</span>
          </h1>

          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            Millions of products across hundreds of categories. Unbeatable prices. Free shipping above ₹499.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, laptops, fashion..."
                className="flex-1 px-5 py-4 text-slate-700 outline-none text-sm sm:text-base"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 m-1.5 rounded-xl">
                Search <FiArrowRight />
              </button>
            </div>
          </form>

          <div className="flex justify-center gap-4 mt-8 text-blue-200 text-sm">
            {['Smartphones', 'Laptops', 'Sneakers', 'Headphones'].map(tag => (
              <button key={tag} onClick={() => navigate(`/products?keyword=${tag}`)} className="hover:text-white transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={color} size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Shop by Category</h2>
            <p className="text-slate-500 text-sm mt-1">Explore our wide range of products</p>
          </div>
          <Link to="/products" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORY_DATA.map(({ name, emoji, bg, color }) => (
            <Link
              key={name}
              to={`/products?category=${name}`}
              className={`${bg} rounded-2xl p-4 text-center hover:scale-105 hover:shadow-md transition-all duration-200 group`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="text-xs font-semibold text-slate-700 leading-tight">{name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 text-sm mt-1">Hand-picked favorites just for you</p>
          </div>
          <Link to="/products?featured=true" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>


      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">New Arrivals</h2>
            <p className="text-slate-500 text-sm mt-1">Just landed in our store</p>
          </div>
          <Link to="/products?sort=newest" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>
    </div>
  );
}
