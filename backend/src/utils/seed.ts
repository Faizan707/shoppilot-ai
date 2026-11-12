import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { slugify } from './slugify.js';

const categoriesData = [
  {
    name: 'Electronics',
    description: 'Gadgets, audio gear, and smart devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
  },
  {
    name: 'Fashion',
    description: 'Apparel and accessories for everyday style',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
  },
  {
    name: 'Home & Living',
    description: 'Furniture, decor, and lifestyle essentials',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
  },
  {
    name: 'Sports & Outdoors',
    description: 'Fitness gear and outdoor equipment',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  },
  {
    name: 'Beauty',
    description: 'Skincare, fragrance, and personal care',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
  },
];

const productsData = [
  {
    name: 'Aurora Wireless Headphones',
    description:
      'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and plush memory-foam cushions for all-day comfort.',
    price: 14999,
    compareAtPrice: 18999,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    ],
    stock: 45,
    brand: 'Aurora',
    tags: ['audio', 'wireless', 'featured'],
    isFeatured: true,
  },
  {
    name: 'Nimbus Smartwatch Pro',
    description:
      'Track workouts, sleep, and notifications with a bright AMOLED display, GPS, and week-long battery performance.',
    price: 22999,
    compareAtPrice: 26999,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    stock: 60,
    brand: 'Nimbus',
    tags: ['wearable', 'fitness'],
    isFeatured: true,
  },
  {
    name: 'Pulse Portable Speaker',
    description:
      'Compact Bluetooth speaker with rich bass, IPX7 waterproofing, and 16 hours of playtime for outdoor sessions.',
    price: 7999,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
    stock: 80,
    brand: 'Pulse',
    tags: ['audio', 'portable'],
  },
  {
    name: 'Vertex Mechanical Keyboard',
    description:
      'Hot-swappable mechanical keyboard with RGB backlight, aluminum frame, and tactile switches for precise typing.',
    price: 11999,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800'],
    stock: 35,
    brand: 'Vertex',
    tags: ['gaming', 'keyboard'],
  },
  {
    name: 'Lumen USB-C Hub',
    description:
      '7-in-1 USB-C hub with HDMI 4K, SD card reader, dual USB-A, and 100W power passthrough for modern laptops.',
    price: 5499,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800'],
    stock: 120,
    brand: 'Lumen',
    tags: ['accessories'],
  },
  {
    name: 'Nordic Wool Overcoat',
    description:
      'Tailored wool-blend overcoat with a clean silhouette, storm flap, and soft flannel lining for cooler seasons.',
    price: 18999,
    compareAtPrice: 22999,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'],
    stock: 28,
    brand: 'Nordic Atelier',
    tags: ['outerwear', 'featured'],
    isFeatured: true,
  },
  {
    name: 'Cityline Leather Sneakers',
    description:
      'Minimal leather sneakers with cushioned soles, breathable lining, and a versatile silhouette for daily wear.',
    price: 9999,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
    stock: 70,
    brand: 'Cityline',
    tags: ['footwear'],
  },
  {
    name: 'Horizon Denim Jacket',
    description:
      'Classic denim jacket with a soft wash, brass hardware, and roomy pockets for effortless layering.',
    price: 8499,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
    stock: 40,
    brand: 'Horizon',
    tags: ['denim'],
  },
  {
    name: 'Silk Soft Tee Pack',
    description:
      'Set of three ultra-soft cotton tees with a refined drape, reinforced seams, and a modern crew neck.',
    price: 4599,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 150,
    brand: 'Softform',
    tags: ['basics'],
  },
  {
    name: 'Cedar Crossbody Bag',
    description:
      'Structured crossbody bag in pebbled vegan leather with adjustable strap and organized interior pockets.',
    price: 6799,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    stock: 55,
    brand: 'Cedar',
    tags: ['bags'],
  },
  {
    name: 'Harbor Ceramic Table Lamp',
    description:
      'Hand-glazed ceramic lamp with a linen shade, warm ambient glow, and a discreet touch dimmer.',
    price: 7299,
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'],
    stock: 32,
    brand: 'Harbor Home',
    tags: ['lighting', 'featured'],
    isFeatured: true,
  },
  {
    name: 'Arcadia Throw Blanket',
    description:
      'Chunky knit throw in breathable cotton blend, perfect for couches and reading nooks.',
    price: 3999,
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800'],
    stock: 90,
    brand: 'Arcadia',
    tags: ['textiles'],
  },
  {
    name: 'Oakridge Serving Board',
    description:
      'Solid oak serving board with juice groove and food-safe oil finish for entertaining.',
    price: 3299,
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
    stock: 65,
    brand: 'Oakridge',
    tags: ['kitchen'],
  },
  {
    name: 'Solstice Scented Candle Set',
    description:
      'Trio of soy candles with cedar, citrus, and vanilla notes in reusable glass jars.',
    price: 2799,
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'],
    stock: 110,
    brand: 'Solstice',
    tags: ['decor'],
  },
  {
    name: 'Frame Modular Shelf',
    description:
      'Open modular shelf unit in powder-coated steel with adjustable shelves for books and display.',
    price: 15999,
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'],
    stock: 20,
    brand: 'Frame',
    tags: ['furniture'],
  },
  {
    name: 'Trailblazer Running Shoes',
    description:
      'Lightweight runners with responsive foam midsoles, breathable mesh, and grippy outsoles.',
    price: 11299,
    compareAtPrice: 13499,
    category: 'Sports & Outdoors',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    stock: 75,
    brand: 'Trailblazer',
    tags: ['running', 'featured'],
    isFeatured: true,
  },
  {
    name: 'Summit Yoga Mat',
    description:
      'Non-slip 6mm yoga mat with alignment markers and a carrying strap for studio or home practice.',
    price: 3499,
    category: 'Sports & Outdoors',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
    stock: 100,
    brand: 'Summit',
    tags: ['yoga'],
  },
  {
    name: 'Peak Resistance Bands Set',
    description:
      'Five-level resistance bands with door anchor and handles for full-body strength training.',
    price: 2499,
    category: 'Sports & Outdoors',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800'],
    stock: 140,
    brand: 'Peak',
    tags: ['fitness'],
  },
  {
    name: 'Alpine Insulated Bottle',
    description:
      '750ml stainless steel bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 2999,
    category: 'Sports & Outdoors',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
    stock: 160,
    brand: 'Alpine',
    tags: ['hydration'],
  },
  {
    name: 'Glow Vitamin C Serum',
    description:
      'Brightening serum with 15% vitamin C, hyaluronic acid, and vitamin E for daily radiance.',
    price: 4199,
    category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'],
    stock: 85,
    brand: 'Glow Lab',
    tags: ['skincare', 'featured'],
    isFeatured: true,
  },
  {
    name: 'Velvet Matte Lip Kit',
    description:
      'Long-wear matte lip kit with three versatile shades and a nourishing balm topper.',
    price: 3599,
    category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800'],
    stock: 95,
    brand: 'Velvet',
    tags: ['makeup'],
  },
  {
    name: 'Cascade Hydrating Mist',
    description:
      'Refreshing facial mist with aloe, rose water, and electrolytes to revive skin anytime.',
    price: 2299,
    category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800'],
    stock: 130,
    brand: 'Cascade',
    tags: ['skincare'],
  },
  {
    name: 'Noir Signature Eau de Parfum',
    description:
      'Warm spicy fragrance with notes of bergamot, cedarwood, and amber in a 50ml bottle.',
    price: 8999,
    category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'],
    stock: 48,
    brand: 'Noir',
    tags: ['fragrance'],
  },
];

/** Inserts sample data into the already-connected database. */
export async function seedDatabase(options: { clear?: boolean } = {}) {
  const clear = options.clear !== false;

  if (clear) {
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
  }

  const admin = await User.create({
    name: 'ShopPilot Admin',
    email: 'admin@shoppilot.ai',
    password: 'Admin123!',
    role: 'admin',
    phone: '+92-300-0000000',
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'customer@shoppilot.ai',
    password: 'Customer123!',
    role: 'customer',
    phone: '+92-321-1234567',
    address: {
      street: '12 Clifton Block 5',
      city: 'Karachi',
      state: 'Sindh',
      postalCode: '75600',
      country: 'Pakistan',
    },
  });

  const categories = await Category.insertMany(
    categoriesData.map((c) => ({
      ...c,
      slug: slugify(c.name),
    }))
  );

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  const products = await Product.insertMany(
    productsData.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: categoryMap[p.category],
      images: p.images,
      stock: p.stock,
      brand: p.brand,
      tags: p.tags,
      isFeatured: Boolean(p.isFeatured),
      rating: 4 + Math.random(),
      numReviews: Math.floor(Math.random() * 20) + 3,
      sold: Math.floor(Math.random() * 80),
    }))
  );

  console.log('Seed completed successfully');
  console.log('--------------------------------');
  console.log(`Admin: admin@shoppilot.ai / Admin123!`);
  console.log(`Customer: customer@shoppilot.ai / Customer123!`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Users: admin + demo customer (${admin.email}, ${customer.email})`);
  console.log('--------------------------------');
}

async function runCli() {
  await connectDB();
  await seedDatabase({ clear: true });
  await mongoose.connection.close();
  process.exit(0);
}

const isCli =
  process.argv[1]?.includes('seed') ||
  process.argv[1]?.replace(/\\/g, '/').endsWith('/utils/seed.ts') ||
  process.argv[1]?.replace(/\\/g, '/').endsWith('/utils/seed.js');

if (isCli) {
  runCli().catch(async (error) => {
    console.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  });
}
