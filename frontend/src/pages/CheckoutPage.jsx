import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiArrowLeft, FiCheck, FiLock } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import * as api from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#334155',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      '::placeholder': { color: '#94a3b8' }
    },
    invalid: { color: '#ef4444' }
  }
};

// ─── Inner checkout form ───────────────────────────────────────────────────────
function CheckoutForm({ cart, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0] || '',
    price: item.price,
    quantity: item.quantity
  }));

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const { street, city, state, pincode, phone } = address;
    if (!street || !city || !state || !pincode || !phone) {
      toast.error('Please fill all address fields');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      // 1. Create order in backend
      const orderRes = await api.createOrder({ shippingAddress: address, paymentMethod, orderItems });
      const orderId = orderRes.data.order._id;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        await clearCart();
        navigate(`/orders/${orderId}`);
        return;
      }

      // 2. Create Stripe payment intent
      const intentRes = await api.createPaymentIntent(total);
      const { clientSecret, paymentIntentId } = intentRes.data;

      // 3. Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: user.name, email: user.email }
        }
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 4. Confirm payment on backend
        await api.confirmPayment(orderId, { paymentIntentId, paymentStatus: 'succeeded' });
        toast.success('Payment successful! 🎉');
        await clearCart();
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order placement failed');
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Steps */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step indicators */}
        <div className="flex items-center gap-4">
          {['Delivery Address', 'Payment'].map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {done ? <FiCheck size={14} /> : num}
                  </div>
                  <span className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
                </div>
                {i < 1 && <div className="flex-1 h-0.5 bg-slate-200"><div className={`h-full bg-blue-600 transition-all ${done ? 'w-full' : 'w-0'}`} /></div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} className="bg-white rounded-3xl shadow-card p-6 space-y-4 fade-in">
            <h2 className="font-display font-bold text-xl text-slate-900 mb-2">Delivery Address</h2>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Street Address *</label>
              <input
                value={address.street}
                onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))}
                placeholder="House/Flat no., Street name, Area"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['City', 'city'], ['State', 'state']].map(([label, field]) => (
                <div key={field}>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label} *</label>
                  <input
                    value={address[field]}
                    onChange={(e) => setAddress(a => ({ ...a, [field]: e.target.value }))}
                    placeholder={label}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all"
                    required
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Pincode *</label>
                <input
                  value={address.pincode}
                  onChange={(e) => setAddress(a => ({ ...a, pincode: e.target.value }))}
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all"
                  required maxLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone *</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-md transition-all">
              Continue to Payment
            </button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl shadow-card p-6 space-y-5 fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-slate-900">Payment Method</h2>
              <button type="button" onClick={() => setStep(1)} className="text-blue-600 text-sm font-semibold hover:underline">
                ← Edit Address
              </button>
            </div>

            {/* Delivery summary */}
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700">
              <p className="font-semibold mb-1">Delivering to:</p>
              <p>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
              <p>Phone: {address.phone}</p>
            </div>

            {/* Payment options */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
                <input type="radio" name="pm" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="accent-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <FiLock size={14} className="text-blue-600" /> Credit / Debit Card
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Secure</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Powered by Stripe</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
                <input type="radio" name="pm" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Cash on Delivery</p>
                  <p className="text-xs text-slate-500 mt-0.5">Pay when your order arrives</p>
                </div>
              </label>
            </div>

            {/* Card element */}
            {paymentMethod === 'stripe' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3">Card Details</p>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
                  <CardElement options={CARD_STYLE} />
                </div>
                <p className="text-xs text-slate-400 mt-2">🔒 Your card info is encrypted and secure</p>
                <p className="text-xs text-blue-600 mt-1">Test card: 4242 4242 4242 4242 | Any future date | Any CVV</p>
              </div>
            )}

            <button
              type="submit"
              disabled={processing || (paymentMethod === 'stripe' && !stripe)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><FiLock size={16} /> {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(total)}`}</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Right: Order summary */}
      <div>
        <div className="bg-white rounded-3xl shadow-card p-6 sticky top-24">
          <h3 className="font-display font-bold text-slate-900 text-lg mb-4">Order Summary</h3>

          <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
            {cart.items.map(({ product, quantity, price }) => (
              <div key={product._id} className="flex gap-3 items-center">
                <img src={product.images?.[0] || ''} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-slate-400">Qty: {quantity}</p>
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0">{formatPrice(price * quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (GST)</span><span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-3 mt-2">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Page wrapper ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  if (!cart?.items?.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 text-sm font-medium transition-colors">
          <FiArrowLeft /> Back to Cart
        </button>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">Checkout</h1>

        <Elements stripe={stripePromise}>
          <CheckoutForm cart={cart} onSuccess={() => {}} />
        </Elements>
      </div>
    </div>
  );
}
