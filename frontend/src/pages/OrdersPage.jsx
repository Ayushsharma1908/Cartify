import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiArrowLeft, FiCheck, FiTruck, FiHome } from 'react-icons/fi';
import * as api from '../services/api';
import { useAuthStore } from '../store';
import Spinner, { OrderSkeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const STATUS_CONFIG = {
  'Pending':    { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: '⏳' },
  'Processing': { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: '⚙️' },
  'Shipped':    { color: 'text-purple-700 bg-purple-50 border-purple-200', icon: '🚚' },
  'Delivered':  { color: 'text-green-700 bg-green-50 border-green-200', icon: '✅' },
  'Cancelled':  { color: 'text-red-700 bg-red-50 border-red-200', icon: '❌' },
};

// ─── Orders List ───────────────────────────────────────────────────────────────
export function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.getMyOrders().then(({ data }) => setOrders(data.orders)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[1,2,3].map(i => <OrderSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-card">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <FiPackage /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG['Pending'];
              return (
                <Link key={order._id} to={`/orders/${order._id}`} className="block">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Order ID</p>
                        <p className="font-mono text-sm font-bold text-slate-700">{order._id.slice(-10).toUpperCase()}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-4">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                        />
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
                          +{order.orderItems.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="mx-2">·</span>
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                      </div>
                      <div className="font-bold text-slate-900">{formatPrice(order.totalPrice)}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!order) return null;

  const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = STEPS.indexOf(order.orderStatus);
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG['Pending'];

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 text-sm font-medium transition-colors">
          <FiArrowLeft /> Back to Orders
        </button>

        {/* Order header */}
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900">Order Details</h1>
              <p className="font-mono text-sm text-slate-500 mt-0.5">#{order._id.slice(-12).toUpperCase()}</p>
            </div>
            <span className={`text-sm font-bold px-4 py-2 rounded-full border self-start ${cfg.color}`}>
              {cfg.icon} {order.orderStatus}
            </span>
          </div>

          {/* Tracking progress */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="relative">
              <div className="flex justify-between relative z-10">
                {STEPS.map((s, i) => {
                  const done = currentStep >= i;
                  const icons = [FiPackage, FiPackage, FiTruck, FiHome];
                  const Icon = icons[i];
                  return (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                        {done && currentStep > i ? <FiCheck size={16} /> : <Icon size={16} />}
                      </div>
                      <span className={`text-xs font-medium ${done ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100 -z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-700"
                  style={{ width: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-card p-6 md:col-span-2">
            <h2 className="font-bold text-slate-900 mb-4">Ordered Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-50" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl shadow-card p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FiHome size={16} /> Delivery Address</h2>
            <div className="text-sm text-slate-700 space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>Pincode: {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-card p-6">
            <h2 className="font-bold text-slate-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t pt-2 mt-2">
                <span>Total Paid</span><span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-700 capitalize">{order.paymentMethod === 'stripe' ? '💳 Card' : '💵 COD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.isPaid ? '✓ Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ordered on</span>
                <span className="text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
