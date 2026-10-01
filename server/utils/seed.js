/* Seeds ShopSphere with demo data.  Usage: npm run seed   |   npm run seed:destroy */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Subscriber = require('../models/Subscriber');

// Placeholder photos from picsum.photos (free image service). They are deterministic per seed
// but are NOT real product photos - swap in real image URLs from the admin panel.
const img = (seed, size = 800) => `https://picsum.photos/seed/${seed}/${size}/${size}`;

const categories = [
  { name: 'Electronics', description: 'Audio, wearables and everyday tech.' },
  { name: 'Fashion', description: 'Clothing and footwear built to last.' },
  { name: 'Home & Living', description: 'Considered pieces for every room.' },
  { name: 'Beauty', description: 'Skincare and self-care essentials.' },
  { name: 'Accessories', description: 'Bags, watches and small details.' },
  { name: 'Sports', description: 'Gear for training and the outdoors.' },
];

// [name, category, price, discountPrice, stock, featured, description]
const products = [
  ['Aurora Wireless Headphones', 'Electronics', 149.0, 119.0, 40, true, 'Over-ear headphones with active noise cancellation, 40-hour battery life and a soft memory-foam fit for all-day listening.'],
  ['Pulse Smartwatch Series 3', 'Electronics', 229.0, null, 25, true, 'Track heart rate, sleep and workouts with a bright AMOLED display and 7-day battery life.'],
  ['Orbit Portable Speaker', 'Electronics', 89.0, 69.0, 60, false, 'Water-resistant Bluetooth speaker with 360-degree sound and 18 hours of playback.'],
  ['Volt 65W USB-C Charger', 'Electronics', 39.0, null, 120, false, 'Compact GaN charger that powers a laptop, phone and tablet at the same time.'],
  ['Meridian Mechanical Keyboard', 'Electronics', 119.0, 99.0, 35, true, 'Hot-swappable 75% keyboard with tactile switches, PBT keycaps and a machined aluminium case.'],
  ['Everyday Oxford Shirt', 'Fashion', 64.0, null, 80, false, 'A crisp organic-cotton shirt cut for a relaxed fit. Works tucked in or out.'],
  ['Northfield Wool Overcoat', 'Fashion', 249.0, 199.0, 18, true, 'Tailored overcoat in a warm wool blend with a full lining and deep pockets.'],
  ['Stride Leather Sneakers', 'Fashion', 129.0, null, 50, true, 'Minimal low-top sneakers in full-grain leather with a cushioned, resoleable sole.'],
  ['Cloud Knit Sweater', 'Fashion', 79.0, 59.0, 70, false, 'Midweight merino-blend knit that stays soft and keeps its shape.'],
  ['Linen Weekend Trousers', 'Fashion', 69.0, null, 65, false, 'Breathable pre-washed linen trousers with an easy drawstring waist.'],
  ['Kiln Ceramic Table Lamp', 'Home & Living', 94.0, null, 30, true, 'Hand-glazed ceramic base with a warm linen shade. Diffused light for reading corners.'],
  ['Woven Cotton Throw Blanket', 'Home & Living', 58.0, 45.0, 55, false, 'Oversized textured throw, woven from 100% cotton and machine washable.'],
  ['Stoneware Dinner Set (16 pc)', 'Home & Living', 139.0, 109.0, 22, true, 'Reactive-glaze stoneware for four. Dishwasher and microwave safe.'],
  ['Cedar & Fig Soy Candle', 'Home & Living', 28.0, null, 150, false, 'Hand-poured soy wax candle with a 50-hour burn time in a reusable amber jar.'],
  ['Dew Hydrating Face Serum', 'Beauty', 34.0, 29.0, 90, true, 'Lightweight serum with hyaluronic acid and niacinamide for all skin types.'],
  ['Silk Repair Night Cream', 'Beauty', 48.0, null, 45, false, 'Rich overnight cream with ceramides to support the skin barrier while you sleep.'],
  ['Mineral Sun Fluid SPF 50', 'Beauty', 26.0, null, 110, false, 'Invisible daily mineral sunscreen with no white cast.'],
  ['Atlas Leather Weekender Bag', 'Accessories', 189.0, 159.0, 15, true, 'Full-grain leather duffel with a padded shoulder strap and a shoe compartment.'],
  ['Slim Steel Automatic Watch', 'Accessories', 179.0, null, 28, false, 'Sapphire crystal, 40mm case and a reliable Japanese automatic movement.'],
  ['Trailhead 28L Backpack', 'Accessories', 99.0, 84.0, 42, false, 'Weather-resistant daypack with a padded laptop sleeve and hidden security pocket.'],
  ['Summit Trail Running Shoes', 'Sports', 119.0, null, 48, true, 'Lightweight trail shoes with aggressive grip and a rock plate for rough terrain.'],
  ['Flex Cork Yoga Mat', 'Sports', 54.0, 44.0, 75, false, 'Non-slip natural cork surface with a 5mm cushioned rubber base.'],
  ['Forge Adjustable Dumbbell Pair', 'Sports', 199.0, null, 20, false, 'Quick-change dumbbells that adjust from 2.5 to 24 kg per hand.'],
  ['Insulated Steel Bottle 750ml', 'Sports', 32.0, 26.0, 130, false, 'Keeps drinks cold for 24 hours or hot for 12. Leak-proof lid.'],
];

const reviewText = [
  [5, 'Exactly as described and arrived earlier than expected. Really pleased with the quality.'],
  [5, 'Feels far more expensive than it is. I have already recommended it to friends.'],
  [4, 'Great value. Minor nitpick with the packaging, but the product itself is excellent.'],
  [4, 'Solid build and looks great. Would buy again.'],
  [3, 'Good overall, though it took a few days to get used to. Does what it says.'],
  [5, 'Bought this as a gift and they loved it. Five stars.'],
];

const users = [
  { name: 'ShopSphere Admin', email: 'admin@shopsphere.com', password: 'Admin@123', role: 'admin' },
  { name: 'Jane Cooper', email: 'jane@example.com', password: 'User@1234' },
  { name: 'Ali Raza', email: 'ali@example.com', password: 'User@1234' },
  { name: 'Sara Ahmed', email: 'sara@example.com', password: 'User@1234' },
  { name: 'Daniel Kim', email: 'daniel@example.com', password: 'User@1234' },
  { name: 'Maria Lopez', email: 'maria@example.com', password: 'User@1234' },
];

const cities = ['Lahore', 'Karachi', 'Islamabad', 'London', 'Toronto', 'Austin'];
const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

async function destroy() {
  await Promise.all([User, Category, Product, Review, Order, Subscriber].map((m) => m.deleteMany()));
}

async function seed() {
  await destroy();

  const cats = await Category.create(
    categories.map((c) => ({ ...c, image: img(`shopsphere-cat-${c.name.replace(/\W/g, '')}`, 600) }))
  );
  const catByName = Object.fromEntries(cats.map((c) => [c.name, c._id]));

  const createdUsers = await User.create(users); // create() runs the bcrypt hook

  const createdProducts = await Product.create(
    products.map(([name, cat, price, discountPrice, stock, featured, description], i) => ({
      name, description, price, discountPrice, stock, featured,
      category: catByName[cat],
      images: [1, 2, 3].map((n) => img(`shopsphere-p${i}-${n}`)),
    }))
  );

  // Reviews: each customer reviews a handful of products (one review per user/product).
  const customers = createdUsers.filter((u) => u.role === 'user');
  for (const [pi, product] of createdProducts.entries()) {
    const count = 1 + (pi % customers.length);
    for (let k = 0; k < count; k += 1) {
      const [rating, comment] = reviewText[(pi + k) % reviewText.length];
      await Review.create({ user: customers[k % customers.length]._id, product: product._id, rating, comment });
    }
  }

  // Orders spread across the last six months so the admin charts have data.
  const orders = [];
  for (let i = 0; i < 36; i += 1) {
    const user = customers[i % customers.length];
    const items = [0, 1, 2].slice(0, 1 + (i % 3)).map((n) => createdProducts[(i * 3 + n * 5) % createdProducts.length]);
    const lines = items.map((p, n) => ({ product: p._id, name: p.name, image: p.images[0], price: p.finalPrice, quantity: 1 + ((i + n) % 2) }));
    const itemsPrice = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
    const shippingPrice = itemsPrice >= 100 ? 0 : 9.99;
    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - Math.floor(i / 7));
    createdAt.setDate(1 + ((i * 5) % 26));
    const isRecent = Date.now() - createdAt.getTime() < 6 * 24 * 3600 * 1000;
    const status = i % 7 === 0 && i > 0 ? 'Cancelled' : isRecent ? 'Pending' : statuses[i % 4];
    orders.push({
      user: user._id,
      products: lines,
      shippingAddress: {
        fullName: user.name, email: user.email, phone: '+92 300 1234567',
        address: `${10 + i} Garden Street`, city: cities[i % cities.length], postalCode: `${54000 + i}`,
      },
      paymentMethod: i % 3 === 0 ? 'cash-on-delivery' : 'demo-card',
      itemsPrice, shippingPrice, totalAmount: Math.round((itemsPrice + shippingPrice) * 100) / 100,
      status, estimatedDelivery: new Date(createdAt.getTime() + 5 * 24 * 3600 * 1000),
      createdAt, updatedAt: createdAt,
    });
  }
  await Order.create(orders);

  console.log(`Seeded ${cats.length} categories, ${createdProducts.length} products, ${createdUsers.length} users, ${orders.length} orders.`);
  console.log('Admin login -> admin@shopsphere.com / Admin@123');
  console.log('User login  -> jane@example.com / User@1234');
}

(async () => {
  try {
    await connectDB();
    if (process.argv.includes('--destroy')) {
      await destroy();
      console.log('All ShopSphere data removed.');
    } else {
      await seed();
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
