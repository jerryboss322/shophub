import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = './data';
if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

const db = new Database('./data/shophub.db');

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    full_name  TEXT NOT NULL,
    phone      TEXT,
    is_admin   INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    price       INTEGER NOT NULL,
    category    TEXT NOT NULL,
    image_url   TEXT,
    stock       INTEGER DEFAULT 10,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name  TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    address        TEXT,
    items          TEXT NOT NULL,
    total          INTEGER NOT NULL,
    status         TEXT DEFAULT 'pending',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_email      ON orders(customer_email);
`);

// Seed admin
const ADMIN_EMAIL = 'admin@shophub.ng';
if (!db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL)) {
  db.prepare('INSERT INTO users (email, password, full_name, is_admin) VALUES (?, ?, ?, 1)')
    .run(ADMIN_EMAIL, bcrypt.hashSync('admin123', 10), 'ShopHub Admin');
}

// Seed products
const { c } = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
if (c === 0) {
  const products = [
    ['iPhone 15 Pro',          'Latest Apple flagship with titanium design and A17 Pro chip.',          1850000, 'Electronics', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80', 12],
    ['Samsung Galaxy S24 Ultra','Premium Android experience with S Pen and 200MP camera.',               1200000, 'Electronics', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80', 8 ],
    ['MacBook Air M3',          'Ultra-thin, blazing-fast laptop with all-day battery life.',           1450000, 'Electronics', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', 6 ],
    ['AirPods Pro 2nd Gen',     'Active noise cancellation with Adaptive Transparency.',                 180000, 'Electronics', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80', 20],
    ['Sony WH-1000XM5',         'Industry-leading wireless noise-cancelling headphones.',                120000, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', 15],
    ['Samsung 55" QLED 4K TV',  '4K QLED Smart TV with Quantum HDR.',                                   450000, 'Electronics', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80', 5 ],
    ['Ankara Print Dress',      'Beautiful Ankara fabric with modern tailoring.',                         25000, 'Fashion',     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', 30],
    ['Nike Air Force 1 White',  'Classic silhouette, premium leather, timeless style.',                   85000, 'Fashion',     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 25],
    ['Premium Leather Watch',   'Stainless steel case with genuine leather strap.',                       65000, 'Fashion',     'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80', 18],
    ['Designer Handbag',        'Genuine leather tote bag, perfect for work and weekend.',                95000, 'Fashion',     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', 12],
    ['Luxury Perfume Set',      'Eau de Parfum, long-lasting oriental fragrance.',                        38000, 'Beauty',      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', 40],
    ['Skincare Bundle',         '5-piece brightening skincare routine.',                                  22000, 'Beauty',      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80', 35],
    ['Premium Blender',         '1200W high-performance blender for smoothies and soups.',                45000, 'Home',        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80', 22],
    ['Memory Foam Pillow',      'Orthopedic neck support for deep sleep.',                                12000, 'Home',        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80', 50],
  ];
  const stmt = db.prepare('INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?,?,?,?,?,?)');
  db.transaction(() => products.forEach(p => stmt.run(...p)))();

  // Seed sample orders
  const orderStmt = db.prepare(`INSERT INTO orders (customer_name, customer_email, customer_phone, address, items, total, status, created_at) VALUES (?,?,?,?,?,?,?,?)`);
  db.transaction(() => {
    orderStmt.run('Amara Okonkwo','amara@example.com','+234 801 234 5678','14 Awolowo Road, Lagos','[{"name":"iPhone 15 Pro","qty":1,"price":1850000}]',1850000,'completed','2025-05-10 10:23:00');
    orderStmt.run('Chidi Nwosu',  'chidi@example.com', '+234 802 345 6789','22 Wuse Zone 3, Abuja','[{"name":"Nike Air Force 1","qty":2,"price":85000}]', 170000, 'pending',  '2025-05-12 14:11:00');
    orderStmt.run('Fatima Bello', 'fatima@example.com','+234 803 456 7890','5 Trans-Amadi, PHC',  '[{"name":"Luxury Perfume Set","qty":3}]',               114000, 'processing','2025-05-14 09:05:00');
  })();
}

export default db;
