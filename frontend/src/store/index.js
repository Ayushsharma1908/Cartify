import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// ─── AUTH STORE ────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      authProvider: null, // 'local' | 'google'

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.login({ email, password });
          localStorage.setItem('cartify_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, authProvider: 'local', loading: false });
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const msg = error.response?.data?.message || 'Login failed';
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.register({ name, email, password });
          localStorage.setItem('cartify_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, authProvider: 'local', loading: false });
          toast.success('Account created successfully!');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const msg = error.response?.data?.message || 'Registration failed';
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        if (supabase) {
          try {
            await supabase.auth.signOut();
          } catch {
            // ignore
          }
        }
        localStorage.removeItem('cartify_token');
        set({ user: null, token: null, isAuthenticated: false, authProvider: null });
        toast.success('Logged out successfully');
      },

      fetchMe: async () => {
        try {
          const { data } = await api.getMe();
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },

      // Supabase helpers (v1) - also exchanges for backend JWT so cart/orders/wishlist work
      syncSupabaseUser: async (session = null) => {
        if (!supabase) return false;
        const s = session || supabase.auth.session();
        if (!s) return false;
        const sUser = s.user;
        const name = sUser.user_metadata?.full_name || sUser.user_metadata?.name || sUser.email;
        const avatarUrl = sUser.user_metadata?.avatar_url || sUser.user_metadata?.picture || null;

        try {
          const { data } = await api.googleAuth({
            email: sUser.email,
            name,
            avatar: avatarUrl
          });
          localStorage.setItem('cartify_token', data.token);
          set({
            user: {
              ...data.user,
              avatarUrl,
              name: data.user.name || name
            },
            token: data.token,
            isAuthenticated: true,
            authProvider: 'google'
          });
          return true;
        } catch (err) {
          console.error('Google auth exchange failed:', err);
          return false;
        }
      },

      loginWithGoogle: async () => {
        if (!supabase) {
          toast.error('Google sign-in is not configured. Add Supabase URL and key in .env');
          return;
        }
        set({ loading: true });
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signIn(
          { provider: 'google' },
          { redirectTo }
        );
        if (error) {
          set({ loading: false });
          toast.error(error.message || 'Google sign-in failed');
        }
        // On success Supabase will redirect away; loading state will be reset on next load via syncSupabaseUser
      },

      updateProfile: async (formData) => {
        try {
          const { data } = await api.updateProfile(formData);
          set({ user: data.user });
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.response?.data?.message || 'Update failed');
          return { success: false };
        }
      },

      isSupabaseConfigured: () => isSupabaseConfigured,
    }),
    {
      name: 'cartify-auth',
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
        authProvider: s.authProvider
      })
    }
  )
);

// ─── CART STORE ────────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  cart: { items: [], totalPrice: 0, totalItems: 0 },
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.getCart();
      set({ cart: data.cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const { data } = await api.addToCart(productId, quantity);
      set({ cart: data.cart });
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      return { success: false };
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const { data } = await api.updateCartItem(productId, quantity);
      set({ cart: data.cart });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  },

  removeItem: async (productId) => {
    try {
      const { data } = await api.removeFromCart(productId);
      set({ cart: data.cart });
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await api.clearCart();
      set({ cart: { items: [], totalPrice: 0, totalItems: 0 } });
    } catch {}
  }
}));

// ─── WISHLIST STORE ────────────────────────────────────────────────────────────
export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,

  fetchWishlist: async () => {
    try {
      const { data } = await api.getWishlist();
      set({ wishlist: data.wishlist });
    } catch {}
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.toggleWishlist(productId);
      if (data.added) {
        toast.success('Added to wishlist');
      } else {
        toast.success('Removed from wishlist');
        set((state) => ({ wishlist: state.wishlist.filter(p => p._id !== productId) }));
      }
      get().fetchWishlist();
      return data.added;
    } catch {
      toast.error('Failed to update wishlist');
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(p => p._id === productId);
  }
}));
