import React from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <HiSparkles className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-800">Car<span className="text-blue-400">tify</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Your one-stop destination for everything. Quality products, unbeatable prices, delivered to your door.
            </p>
            <div className="flex gap-3 mt-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Electronics', 'Fashion', 'Mobiles', 'Home & Furniture', 'Beauty', 'Sports'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="hover:text-blue-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Account</h4>
            <ul className="space-y-2 text-sm">
              {[['Profile', '/profile'], ['Orders', '/orders'], ['Wishlist', '/wishlist'], ['Cart', '/cart']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 font-display">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📞 1800-XXX-XXXX</li>
              <li>✉️ support@cartify.in</li>
              <li>⏰ Mon–Sat: 9AM–9PM</li>
              <li className="mt-4 text-blue-400 font-medium">Free shipping over ₹499</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2024 Cartify. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
