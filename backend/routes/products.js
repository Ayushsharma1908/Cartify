const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/products - Get all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, rating, sort, page = 1, limit = 12, featured } = req.query;

    let query = { isActive: true };

    // Search by keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (featured) query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.ratings = { $gte: Number(rating) };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { ratings: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'popular': sortOption = { numReviews: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/products/seed - Seed sample products (no auth, dev use)
router.post('/seed', async (req, res) => {
  try {
    const sampleProducts = [
      { name: 'Samsung Galaxy S24 Ultra', description: 'Flagship smartphone with 200MP camera.', price: 89999, originalPrice: 99999, category: 'Mobiles', brand: 'Samsung', stock: 50, images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'], isFeatured: true, ratings: 4.5, numReviews: 128, tags: ['smartphone', '5g'] },
      { name: 'Apple MacBook Air M3', description: 'Thin and light laptop.', price: 114900, originalPrice: 129900, category: 'Electronics', brand: 'Apple', stock: 30, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], isFeatured: true, ratings: 4.8, numReviews: 256, tags: ['laptop'] },
      { name: 'Sony WH-1000XM5', description: 'Noise canceling headphones.', price: 24990, originalPrice: 29990, category: 'Electronics', brand: 'Sony', stock: 75, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], isFeatured: true, ratings: 4.6, numReviews: 89, tags: ['headphones'] },
      { name: 'Nike Air Max 270', description: 'Comfortable sneakers.', price: 8495, originalPrice: 12995, category: 'Fashion', brand: 'Nike', stock: 100, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], isFeatured: false, ratings: 4.3, numReviews: 412, tags: ['shoes'] },
      { name: "Levi's 501 Jeans", description: 'Classic denim.', price: 3499, originalPrice: 4999, category: 'Fashion', brand: "Levi's", stock: 200, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], isFeatured: false, ratings: 4.4, numReviews: 1024, tags: ['jeans'] },
      { name: 'IKEA MALM Bed Frame', description: 'Wooden queen bed.', price: 12999, originalPrice: 15999, category: 'Home & Furniture', brand: 'IKEA', stock: 25, images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400'], isFeatured: true, ratings: 4.5, numReviews: 234, tags: ['furniture'] },
      { name: 'Maybelline Fit Me Foundation', description: 'Oil-free foundation.', price: 449, originalPrice: 549, category: 'Beauty', brand: 'Maybelline', stock: 200, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], isFeatured: true, ratings: 4.3, numReviews: 567, tags: ['makeup'] },
      { name: 'Yonex Badminton Racket', description: 'Lightweight carbon racket.', price: 2499, originalPrice: 2999, category: 'Sports', brand: 'Yonex', stock: 45, images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'], isFeatured: true, ratings: 4.7, numReviews: 156, tags: ['sports'] },
      { name: 'Atomic Habits', description: 'Build good habits.', price: 399, originalPrice: 499, category: 'Books', brand: 'Random House', stock: 200, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], isFeatured: true, ratings: 4.8, numReviews: 2500, tags: ['books'] },
      { name: 'LEGO Technic Car', description: 'Buildable 400+ pieces.', price: 2999, originalPrice: 3499, category: 'Toys', brand: 'LEGO', stock: 60, images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'], isFeatured: true, ratings: 4.8, numReviews: 456, tags: ['toys'] },
      { name: 'Kellogg\'s Corn Flakes', description: '500g cereal.', price: 149, originalPrice: 179, category: 'Grocery', brand: 'Kellogg\'s', stock: 500, images: ['https://images.unsplash.com/photo-1622227922572-39ff3cb4591f?w=400'], isFeatured: false, ratings: 4.5, numReviews: 2000, tags: ['grocery'] },
      { name: 'Philips Air Fryer', description: '4.1L digital.', price: 4999, originalPrice: 5999, category: 'Appliances', brand: 'Philips', stock: 50, images: ['https://images.unsplash.com/photo-1585309860637-4d81e7fa1360?w=400'], isFeatured: true, ratings: 4.5, numReviews: 456, tags: ['appliances'] },
      { name: 'Dyson V15 Detect', description: 'Cordless vacuum.', price: 49900, originalPrice: 59900, category: 'Appliances', brand: 'Dyson', stock: 20, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], isFeatured: true, ratings: 4.7, numReviews: 67, tags: ['vacuum'] },
    ];
    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `Seeded ${created.length} products`, count: created.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/products - Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @PUT /api/products/:id - Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @DELETE /api/products/:id - Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/products/:id/review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.calculateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/products/seed - Seed sample products (dev only)
router.post('/admin/seed', protect, adminOnly, async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'The latest Samsung flagship with AI-powered features, 200MP camera, and titanium frame.',
        price: 89999,
        originalPrice: 99999,
        category: 'Mobiles',
        brand: 'Samsung',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
        isFeatured: true,
        ratings: 4.5,
        numReviews: 128,
        specifications: [{ key: 'RAM', value: '12GB' }, { key: 'Storage', value: '256GB' }],
        tags: ['smartphone', 'samsung', '5g', 'flagship']
      },
      {
        name: 'Apple MacBook Air M3',
        description: 'Supercharged by M3 chip. Incredibly thin and light laptop with all-day battery life.',
        price: 114900,
        originalPrice: 129900,
        category: 'Electronics',
        brand: 'Apple',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
        isFeatured: true,
        ratings: 4.8,
        numReviews: 256,
        tags: ['laptop', 'apple', 'macbook']
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling headphones with 30-hour battery life and crystal clear calls.',
        price: 24990,
        originalPrice: 29990,
        category: 'Electronics',
        brand: 'Sony',
        stock: 75,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        isFeatured: true,
        ratings: 4.6,
        numReviews: 89,
        tags: ['headphones', 'sony', 'wireless', 'noise-cancelling']
      },
      {
        name: 'Nike Air Max 270',
        description: 'The Nike Air Max 270 delivers visible cushioning under every step with a large air unit.',
        price: 8495,
        originalPrice: 12995,
        category: 'Fashion',
        brand: 'Nike',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
        isFeatured: false,
        ratings: 4.3,
        numReviews: 412,
        tags: ['shoes', 'nike', 'sports', 'running']
      },
      {
        name: 'Dyson V15 Detect Vacuum',
        description: 'Laser-guided, acoustically intelligent vacuum cleaner with HEPA filtration.',
        price: 49900,
        originalPrice: 59900,
        category: 'Appliances',
        brand: 'Dyson',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        isFeatured: true,
        ratings: 4.7,
        numReviews: 67,
        tags: ['vacuum', 'dyson', 'cleaning', 'cordless']
      },
      {
        name: 'Levi\'s 501 Original Jeans',
        description: 'The original blue jean since 1873. Sits at waist with a straight leg through thigh and knee.',
        price: 3499,
        originalPrice: 4999,
        category: 'Fashion',
        brand: 'Levi\'s',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
        isFeatured: false,
        ratings: 4.4,
        numReviews: 1024,
        tags: ['jeans', 'levis', 'denim', 'casual']
      }
    ];

    await Product.deleteMany({});
    const products = await Product.insertMany(sampleProducts.map(p => ({ ...p, seller: req.user._id })));
    res.json({ success: true, message: `${products.length} products seeded`, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
