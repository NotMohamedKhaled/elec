const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const connectDB = require('./db');

const PRODUCTS = [
  {
    title: 'MacBook Pro 14"',
    category: "Laptops",
    price: 1999.99,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    description: "Powerful laptop with M3 chip, 16GB RAM, 512GB SSD.",
    specs: ["M3 Pro chip", "16GB RAM", "512GB SSD", "14-inch Liquid Retina XDR"],
  },
  {
    title: "Dell XPS 15",
    category: "Laptops",
    price: 1749.99,
    img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop",
    description: "Premium Windows laptop with OLED display and Intel Core i9.",
    specs: ["Intel Core i9", "32GB RAM", "1TB SSD", "15.6-inch OLED 3.5K"],
  },
  {
    title: "Lenovo ThinkPad X1 Carbon",
    category: "Laptops",
    price: 1499.99,
    img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
    description: "Ultra-light business laptop built for productivity on the go.",
    specs: ["Intel Core i7", "16GB RAM", "512GB SSD", "14-inch 2K IPS"],
  },
  {
    title: "ASUS ROG Zephyrus G14",
    category: "Laptops",
    price: 1599.99,
    img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
    description: "Gaming laptop with AMD Ryzen 9 and RTX 4060.",
    specs: ["AMD Ryzen 9", "16GB DDR5", "1TB SSD", "RTX 4060"],
  },
  {
    title: "iPhone 15 Pro",
    category: "Smartphones",
    price: 1199.99,
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
    description: "Latest iPhone with A17 Pro chip, titanium design, 48MP camera.",
    specs: ["A17 Pro chip", "6.1-inch OLED", "48MP main camera", "256GB storage"],
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    category: "Smartphones",
    price: 1299.99,
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop",
    description: "Flagship Android with built-in S Pen and 200MP camera.",
    specs: ["Snapdragon 8 Gen 3", "12GB RAM", "200MP camera", "S Pen included"],
  },
  {
    title: "Google Pixel 8 Pro",
    category: "Smartphones",
    price: 999.99,
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop",
    description: "AI-powered Android phone with Google Tensor G3 chip.",
    specs: ["Tensor G3 chip", "12GB RAM", "50MP triple camera", "6.7-inch LTPO OLED"],
  },
  {
    title: "OnePlus 12",
    category: "Smartphones",
    price: 799.99,
    img: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=300&fit=crop",
    description: "Flagship killer with Hasselblad cameras and ultra-fast charging.",
    specs: ["Snapdragon 8 Gen 3", "16GB RAM", "50MP Hasselblad", "100W charging"],
  },
  {
    title: "Sony WH-1000XM5",
    category: "Audio",
    price: 399.99,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    description: "Industry-leading noise cancelling headphones with superb sound quality.",
    specs: ["Noise cancelling", "30h battery", "Bluetooth 5.2", "Touch control"],
  },
  {
    title: "Apple AirPods Pro 2",
    category: "Audio",
    price: 249.99,
    img: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=300&fit=crop",
    description: "True wireless earbuds with Adaptive Transparency and H2 chip.",
    specs: ["H2 chip", "ANC + Transparency", "6h battery + 30h case", "IPX4"],
  },
  {
    title: "Bose QuietComfort 45",
    category: "Audio",
    price: 329.99,
    img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop",
    description: "Premium over-ear headphones with world-class noise cancellation.",
    specs: ["QuietComfort ANC", "24h battery", "Bluetooth 5.1", "Foldable design"],
  },
  {
    title: "Sonos Era 100",
    category: "Audio",
    price: 249.99,
    img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    description: "Smart speaker with rich stereo sound and multi-room capability.",
    specs: ["Wi-Fi 6", "AirPlay 2", "Voice control", "Stereo pair ready"],
  },
  {
    title: "Apple Watch Ultra 2",
    category: "Wearables",
    price: 799.99,
    img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop",
    description: "Rugged smartwatch for athletes and adventurers.",
    specs: ["49mm titanium", "GPS + Cellular", "100m water resistant", "S9 chip"],
  },
  {
    title: "Samsung Galaxy Watch 6",
    category: "Wearables",
    price: 329.99,
    img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=300&fit=crop",
    description: "Advanced health tracking smartwatch with BioActive sensor.",
    specs: ["Exynos W930", "BioActive sensor", "44mm AMOLED", "5ATM + IP68"],
  },
  {
    title: "Garmin Fenix 7X",
    category: "Wearables",
    price: 699.99,
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    description: "Multi-sport GPS smartwatch built for extreme adventures.",
    specs: ["Multi-band GPS", "28-day battery", "Solar charging", "Sapphire lens"],
  },
  {
    title: "Fitbit Charge 6",
    category: "Wearables",
    price: 159.99,
    img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop",
    description: "Advanced fitness tracker with built-in GPS and Google integration.",
    specs: ["Built-in GPS", "Heart rate 24/7", "7-day battery", "Google apps"],
  },
  {
    title: "Canon EOS R6 Mark II",
    category: "Cameras",
    price: 2499.99,
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
    description: "Full-frame mirrorless camera for professionals.",
    specs: ["24.2MP sensor", "4K 60p video", "Dual Pixel AF", "IBIS"],
  },
  {
    title: "Sony Alpha A7 IV",
    category: "Cameras",
    price: 2799.99,
    img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    description: "Hybrid full-frame mirrorless for photo and video creators.",
    specs: ["33MP BSI CMOS", "4K 60p video", "Real-time Eye AF", "Dual card slots"],
  },
  {
    title: "GoPro Hero 12 Black",
    category: "Cameras",
    price: 399.99,
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    description: "Waterproof action camera with HyperSmooth 6.0 stabilization.",
    specs: ["5.3K60 video", "27MP photo", "HyperSmooth 6.0", "Waterproof 10m"],
  },
  {
    title: "Keychron K6",
    category: "Accessories",
    price: 89.99,
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
    description: "Wireless mechanical keyboard with hot-swappable switches.",
    specs: ["65% layout", "Bluetooth 5.1", "RGB backlight", "Gateron switches"],
  },
  {
    title: "Logitech MX Master 3S",
    category: "Accessories",
    price: 99.99,
    img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    description: "Ergonomic wireless mouse with ultra-fast MagSpeed scrolling.",
    specs: ["8K DPI sensor", "Silent clicks", "USB-C charging", "Multi-device"],
  },
  {
    title: "Anker 737 Power Bank",
    category: "Accessories",
    price: 149.99,
    img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    description: "24,000mAh portable charger with 140W max output.",
    specs: ["24,000mAh", "140W output", "USB-C x2 + USB-A", "Smart display"],
  },
  {
    title: "Razer DeathAdder V3",
    category: "Accessories",
    price: 69.99,
    img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=300&fit=crop",
    description: "Lightweight ergonomic gaming mouse with 30K DPI optical sensor.",
    specs: ["30,000 DPI", "63g ultra-light", "90hr battery", "USB-C wireless"],
  }
];

async function seed() {
  await connectDB();
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(PRODUCTS);
    console.log("Database seeded successfully with initial products!");
  } else {
    console.log("Database already has products.");
  }
  process.exit(0);
}

seed();
