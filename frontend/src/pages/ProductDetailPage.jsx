import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi';
import * as api from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../store';
import Spinner from '../components/common/Skeleton';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.getProduct(id);
        setProduct(data.product);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await addToCart(product._id, quantity);
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product._id);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setReviewLoading(true);
    try {
      await api.addReview(id, reviewData);
      toast.success('Review submitted!');
      const { data } = await api.getProduct(id);
      setProduct(data.product);
      setReviewData({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors text-sm font-medium"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="bg-white rounded-3xl p-6 shadow-card">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=Product'; }}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-blue-500 shadow-md' : 'border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <img src={img} alt={i} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{product.brand}</p>
              <h1 className="text-2xl font-display font-bold text-slate-900 leading-snug">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                  <FiStar size={12} /> {product.ratings || 0}
                </div>
                <span className="text-sm text-slate-500">{product.numReviews} ratings</span>
                <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg price-original">{formatPrice(product.originalPrice)}</span>
                    <span className="text-green-600 font-bold text-lg">{discount}% off</span>
                  </>
                )}
              </div>
              {product.price >= 499 && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-2">
                  <FiTruck size={12} /> Free delivery on this order
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                <span className="text-xs text-slate-500">{product.stock} available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className="w-14 flex items-center justify-center border-2 border-slate-200 rounded-2xl hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                {inWishlist
                  ? <HiHeart className="text-red-500" size={22} />
                  : <FiHeart className="text-slate-500" size={20} />
                }
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FiTruck, text: 'Free Delivery above ₹499' },
                { icon: FiShield, text: '1 Year Warranty' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
                  <Icon className="text-blue-600 shrink-0" size={15} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="flex border-b border-slate-100">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab} {tab === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-slate-700 leading-relaxed">{product.description}</p>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specifications?.map(({ key, value }) => (
                  <div key={key} className="flex bg-slate-50 rounded-xl overflow-hidden">
                    <span className="bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 w-40 shrink-0">{key}</span>
                    <span className="px-4 py-2.5 text-sm text-slate-600">{value}</span>
                  </div>
                ))}
                {(!product.specifications || product.specifications.length === 0) && (
                  <p className="text-slate-500 text-sm">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review form */}
                {isAuthenticated && (
                  <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-slate-800">Write a Review</h3>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Your Rating</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setReviewData(d => ({ ...d, rating: r }))}
                            className={`text-2xl transition-transform hover:scale-110 ${r <= reviewData.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData(d => ({ ...d, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={3}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white resize-none"
                    />
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews list */}
                <div className="space-y-4">
                  {product.reviews?.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
                  ) : (
                    product.reviews.map(review => (
                      <div key={review._id} className="border border-slate-100 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{review.name}</p>
                              <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                            <FiStar size={9} /> {review.rating}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
