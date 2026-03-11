import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import * as api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Furniture', 'Beauty', 'Sports', 'Books', 'Toys', 'Grocery', 'Appliances', 'Mobiles'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { keyword, category, sort, page, limit: 12 };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;

      const { data } = await api.getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page, minPrice, maxPrice, rating]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) {
      params[key] = value;
    } else {
      delete params[key];
    }
    params.page = '1';
    setSearchParams(params);
  };

  const applyPriceFilter = () => {
    const params = Object.fromEntries(searchParams);
    if (priceRange.min) params.minPrice = priceRange.min;
    else delete params.minPrice;
    if (priceRange.max) params.maxPrice = priceRange.max;
    else delete params.maxPrice;
    params.page = '1';
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = {};
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
    setPriceRange({ min: '', max: '' });
  };

  const hasFilters = category || minPrice || maxPrice || rating;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              {keyword ? `Results for "${keyword}"` : category || 'All Products'}
            </h1>
            {!loading && <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-700 hover:border-blue-400 transition-colors shadow-sm"
            >
              <FiFilter size={14} /> Filters {hasFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${filterOpen ? 'fixed inset-0 z-40 bg-black/50 md:relative md:inset-auto md:z-auto md:bg-transparent' : 'hidden md:block'} w-full md:w-60 shrink-0`}>
            <div className={`${filterOpen ? 'absolute right-0 top-0 h-full w-72 bg-white overflow-y-auto p-6 md:relative md:w-auto md:bg-transparent md:p-0' : ''} md:sticky md:top-24`}>
              {filterOpen && (
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setFilterOpen(false)}><FiX size={20} /></button>
                </div>
              )}

              <div className="space-y-4">
                {/* Category filter */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
                  <h3 className="font-semibold text-slate-800 mb-4 font-display">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={category === cat}
                          onChange={() => updateParam('category', category === cat ? '' : cat)}
                          className="accent-blue-600"
                        />
                        <span className={`text-sm ${category === cat ? 'text-blue-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'} transition-colors`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price filter */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
                  <h3 className="font-semibold text-slate-800 mb-4 font-display">Price Range</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Rating filter */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
                  <h3 className="font-semibold text-slate-800 mb-4 font-display">Rating</h3>
                  {[4, 3, 2, 1].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="radio"
                        name="rating"
                        checked={rating === String(r)}
                        onChange={() => updateParam('rating', rating === String(r) ? '' : String(r))}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-yellow-500">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                      <span className="text-xs text-slate-500">& above</span>
                    </label>
                  ))}
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full border border-red-200 text-red-500 text-sm font-semibold py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiX size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No products found</h3>
                <p className="text-slate-500">Try different keywords or filters</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 font-semibold hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 fade-in">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => updateParam('page', String(p))}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          page === p
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
