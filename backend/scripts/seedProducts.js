/**
 * Seed products across all categories. Run: node scripts/seedProducts.js
 * Requires: MongoDB running, MONGO_URI in backend/.env
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  // Electronics
  { name: 'Samsung Galaxy S24 Ultra', description: 'Flagship smartphone with 200MP camera, AI features, titanium frame.', price: 89999, originalPrice: 99999, category: 'Mobiles', brand: 'Samsung', stock: 50, images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'], isFeatured: true, ratings: 4.5, numReviews: 128, tags: ['smartphone', '5g'] },
  { name: 'Apple MacBook Air M3', description: 'Thin and light laptop with all-day battery, M3 chip.', price: 114900, originalPrice: 129900, category: 'Electronics', brand: 'Apple', stock: 30, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], isFeatured: true, ratings: 4.8, numReviews: 256, tags: ['laptop', 'apple'] },
  { name: 'Sony WH-1000XM5', description: 'Noise canceling headphones, 30hr battery.', price: 24990, originalPrice: 29990, category: 'Electronics', brand: 'Sony', stock: 75, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], isFeatured: true, ratings: 4.6, numReviews: 89, tags: ['headphones', 'wireless'] },
  // Fashion
  { name: 'Nike Air Max 270', description: 'Visible cushioning, large air unit.', price: 8495, originalPrice: 12995, category: 'Fashion', brand: 'Nike', stock: 100, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], isFeatured: false, ratings: 4.3, numReviews: 412, tags: ['shoes', 'running'] },
  { name: "Levi's 501 Original Jeans", description: 'Classic blue jean since 1873.', price: 3499, originalPrice: 4999, category: 'Fashion', brand: "Levi's", stock: 200, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], isFeatured: false, ratings: 4.4, numReviews: 1024, tags: ['jeans', 'denim'] },
  { name: 'Adidas Classic T-Shirt', description: 'Comfortable cotton tee, iconic logo.', price: 1299, originalPrice: 1799, category: 'Fashion', brand: 'Adidas', stock: 150, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], isFeatured: false, ratings: 4.2, numReviews: 89, tags: ['tshirt', 'casual'] },
  // Home & Furniture
  { name: 'IKEA MALM Bed Frame', description: 'Minimalist wooden bed frame, queen size.', price: 12999, originalPrice: 15999, category: 'Home & Furniture', brand: 'IKEA', stock: 25, images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400'], isFeatured: true, ratings: 4.5, numReviews: 234, tags: ['bed', 'furniture'] },
  { name: 'Urban Ladder Sofa', description: '3-seater fabric sofa, gray.', price: 24999, originalPrice: 29999, category: 'Home & Furniture', brand: 'Urban Ladder', stock: 15, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'], isFeatured: true, ratings: 4.6, numReviews: 78, tags: ['sofa', 'living room'] },
  { name: 'Study Desk with Storage', description: 'Compact desk with shelves.', price: 5999, originalPrice: 7499, category: 'Home & Furniture', brand: 'HomeTown', stock: 40, images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'], isFeatured: false, ratings: 4.0, numReviews: 56, tags: ['desk', 'office'] },
  // Beauty
  { name: 'Lakme 9to5 Primer + Matte', description: 'Long-lasting matte lipstick.', price: 499, originalPrice: 599, category: 'Beauty', brand: 'Lakme', stock: 500, images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'], isFeatured: false, ratings: 4.4, numReviews: 1200, tags: ['lipstick', 'makeup'] },
  { name: 'Dove Body Wash', description: 'Moisturizing body wash, 1L.', price: 299, originalPrice: 349, category: 'Beauty', brand: 'Dove', stock: 300, images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'], isFeatured: false, ratings: 4.5, numReviews: 890, tags: ['body wash', 'skincare'] },
  { name: 'Maybelline Fit Me Foundation', description: 'Oil-free foundation, natural finish.', price: 449, originalPrice: 549, category: 'Beauty', brand: 'Maybelline', stock: 200, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], isFeatured: true, ratings: 4.3, numReviews: 567, tags: ['foundation', 'makeup'] },
  // Sports
  { name: 'Nivia Storm Football', description: 'Size 5 professional football.', price: 599, originalPrice: 799, category: 'Sports', brand: 'Nivia', stock: 80, images: ['https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400'], isFeatured: false, ratings: 4.2, numReviews: 234, tags: ['football', 'sports'] },
  { name: 'Yonex Badminton Racket', description: 'Lightweight carbon racket.', price: 2499, originalPrice: 2999, category: 'Sports', brand: 'Yonex', stock: 45, images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'], isFeatured: true, ratings: 4.7, numReviews: 156, tags: ['badminton', 'racket'] },
  { name: 'Cockatoo Yoga Mat', description: 'Non-slip 6mm yoga mat.', price: 799, originalPrice: 999, category: 'Sports', brand: 'Cockatoo', stock: 120, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], isFeatured: false, ratings: 4.4, numReviews: 312, tags: ['yoga', 'fitness'] },
  // Books
  { name: 'Atomic Habits', description: 'Build good habits, break bad ones.', price: 399, originalPrice: 499, category: 'Books', brand: 'Random House', stock: 200, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], isFeatured: true, ratings: 4.8, numReviews: 2500, tags: ['self-help', 'habits'] },
  { name: 'The Psychology of Money', description: 'Timeless lessons on wealth and happiness.', price: 349, originalPrice: 449, category: 'Books', brand: 'Harriman House', stock: 150, images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'], isFeatured: true, ratings: 4.7, numReviews: 1200, tags: ['finance', 'psychology'] },
  { name: 'Clean Code', description: 'Handbook of agile software craftsmanship.', price: 599, originalPrice: 699, category: 'Books', brand: 'Prentice Hall', stock: 80, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'], isFeatured: false, ratings: 4.6, numReviews: 890, tags: ['programming', 'software'] },
  // Toys
  { name: 'LEGO Technic Car', description: 'Buildable car model, 400+ pieces.', price: 2999, originalPrice: 3499, category: 'Toys', brand: 'LEGO', stock: 60, images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'], isFeatured: true, ratings: 4.8, numReviews: 456, tags: ['lego', 'building'] },
  { name: 'Nerf Blaster', description: 'Foam dart blaster, 6 darts.', price: 999, originalPrice: 1199, category: 'Toys', brand: 'Nerf', stock: 90, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], isFeatured: false, ratings: 4.3, numReviews: 234, tags: ['nerf', 'outdoor'] },
  { name: 'Board Game - Catan', description: 'Strategy board game for 3-4 players.', price: 2499, originalPrice: 2799, category: 'Toys', brand: 'Catan Studio', stock: 40, images: ['https://images.unsplash.com/photo-1611195974226-ef7b3d96b044?w=400'], isFeatured: false, ratings: 4.7, numReviews: 189, tags: ['board game', 'strategy'] },
  // Grocery
  { name: 'Kellogg\'s Corn Flakes', description: 'Crispy corn flakes, 500g.', price: 149, originalPrice: 179, category: 'Grocery', brand: 'Kellogg\'s', stock: 500, images: ['https://images.unsplash.com/photo-1622227922572-39ff3cb4591f?w=400'], isFeatured: false, ratings: 4.5, numReviews: 2000, tags: ['cereal', 'breakfast'] },
  { name: 'Amul Butter', description: 'Fresh butter, 500g pack.', price: 299, originalPrice: 329, category: 'Grocery', brand: 'Amul', stock: 300, images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'], isFeatured: false, ratings: 4.6, numReviews: 1200, tags: ['butter', 'dairy'] },
  { name: 'Tata Salt', description: 'Iodized salt, 1kg.', price: 22, originalPrice: 25, category: 'Grocery', brand: 'Tata', stock: 1000, images: ['https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400'], isFeatured: false, ratings: 4.4, numReviews: 3500, tags: ['salt', 'essentials'] },
  // Appliances
  { name: 'Dyson V15 Detect Vacuum', description: 'Laser-guided cordless vacuum.', price: 49900, originalPrice: 59900, category: 'Appliances', brand: 'Dyson', stock: 20, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], isFeatured: true, ratings: 4.7, numReviews: 67, tags: ['vacuum', 'cordless'] },
  { name: 'Philips Air Fryer', description: '4.1L digital air fryer.', price: 4999, originalPrice: 5999, category: 'Appliances', brand: 'Philips', stock: 50, images: ['https://images.unsplash.com/photo-1585309860637-4d81e7fa1360?w=400'], isFeatured: true, ratings: 4.5, numReviews: 456, tags: ['air fryer', 'kitchen'] },
  { name: 'OnePlus Nord CE 3', description: '5G smartphone, 128GB.', price: 24999, originalPrice: 27999, category: 'Mobiles', brand: 'OnePlus', stock: 100, images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'], isFeatured: true, ratings: 4.3, numReviews: 890, tags: ['5g', 'android'] },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartify');
    console.log('✅ Connected to MongoDB');
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products across categories`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

run();
