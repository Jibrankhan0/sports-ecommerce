-- Sports Store Database Schema
CREATE DATABASE IF NOT EXISTS sportstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sportstore;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar VARCHAR(255) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  specifications TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  brand VARCHAR(100),
  images JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(255),
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT,
  user_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@sportstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample user (password: user123)
INSERT INTO users (name, email, password, phone, role) VALUES
('John Doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+923001234567', 'user');

-- Categories
INSERT INTO categories (name, slug, description, image) VALUES
('Cricket', 'cricket', 'Professional cricket equipment and accessories', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400'),
('Football', 'football', 'Football gear, balls and training equipment', 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Badminton', 'badminton', 'Rackets, shuttlecocks and court equipment', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'),
('Tennis', 'tennis', 'Professional tennis rackets and equipment', 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=400'),
('Gym Equipment', 'gym-equipment', 'Home and commercial gym equipment', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Running Shoes', 'running-shoes', 'High performance running footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Sports Accessories', 'sports-accessories', 'Bags, bottles, and sports accessories', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400');

-- Products
INSERT INTO products (name, slug, description, specifications, price, discount_price, stock, category_id, brand, images, rating, review_count, sold_count, is_featured, is_trending, is_new_arrival, is_best_seller) VALUES
('Pro Cricket Bat English Willow', 'pro-cricket-bat-english-willow', 'Premium English willow cricket bat crafted for professional players. Features a thick edge and mid-sweet spot for maximum power.', 'Weight: 1.2kg | Blade: English Willow Grade 1 | Handle: Cane | Size: Full | Sweet Spot: Mid', 8500.00, 7200.00, 25, 1, 'SG', '["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800","https://images.unsplash.com/photo-1619187282761-5ca5dc6f85c7?w=800"]', 4.8, 124, 312, TRUE, TRUE, FALSE, TRUE),
('Nike Mercurial Football Boots', 'nike-mercurial-football-boots', 'Explosive speed and precision touch with Nike Mercurial boots. Designed for fast wingers and strikers on firm ground.', 'Upper: Flyknit | Sole: TPU | Stud: FG | Closure: Laces | Available: Sizes 6-12', 12500.00, 10999.00, 40, 2, 'Nike', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]', 4.7, 89, 201, TRUE, FALSE, TRUE, FALSE),
('Yonex Astrox 99 Badminton Racket', 'yonex-astrox-99-badminton-racket', 'Steeper angle attack with rotational generator system. Preferred by world top players for overhead power play.', 'Weight: 83g (4U) | Flex: Stiff | Frame: HM Graphite | Shaft: Ultra PEF | Balance: Head Heavy', 18500.00, 16800.00, 15, 3, 'Yonex', '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"]', 4.9, 67, 98, TRUE, TRUE, TRUE, TRUE),
('Wilson Pro Staff Tennis Racket', 'wilson-pro-staff-tennis-racket', 'Roger Federer signature racket with braided graphite and kevlar. Iconic for precision and control.', 'Weight: 340g | Head: 90 sq.in | Length: 27in | Frame: Braided Graphite | Grip: 4 1/4', 22000.00, NULL, 10, 4, 'Wilson', '["https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=800"]', 4.8, 45, 76, FALSE, FALSE, FALSE, TRUE),
('Adjustable Dumbbell Set 5-50kg', 'adjustable-dumbbell-set', 'Space-saving adjustable dumbbell set. Replaces 15 sets of weights. Perfect for home gym workouts.', 'Weight Range: 5-50kg | Increment: 2.5kg | Material: Steel | Coating: Rubber | Dimensions: 40x20cm', 35000.00, 29999.00, 8, 5, 'PowerFlex', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]', 4.6, 203, 445, TRUE, FALSE, FALSE, TRUE),
('Adidas Ultraboost 22 Running Shoes', 'adidas-ultraboost-22-running-shoes', 'The most responsive Boost ever. PRIMEKNIT+ upper and Continental rubber outsole for unmatched comfort and grip.', 'Upper: PRIMEKNIT+ | Midsole: Boost | Outsole: Continental | Drop: 10mm | Weight: 310g', 15500.00, 13500.00, 30, 6, 'Adidas', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]', 4.7, 312, 891, TRUE, TRUE, FALSE, TRUE),
('Kookaburra Cricket Gloves Pro', 'kookaburra-cricket-gloves-pro', 'Professional grade batting gloves with high density foam protection and full leather palm.', 'Material: Full Leather | Fingers: Sausage Roll | Palm: High Density Foam | Sizes: S/M/L/XL', 2800.00, 2400.00, 50, 1, 'Kookaburra', '["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"]', 4.4, 78, 234, FALSE, FALSE, TRUE, FALSE),
('Adidas Tiro 21 Football', 'adidas-tiro-21-football', 'Machine stitched training football with butyl bladder for consistent air retention. FIFA Basic approved.', 'Size: 5 | Panel: 20 | Cover: TPU | Bladder: Butyl | Circumference: 68-70cm', 3500.00, 2999.00, 45, 2, 'Adidas', '["https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800"]', 4.5, 156, 567, FALSE, TRUE, FALSE, FALSE),
('Li-Ning Carbon Badminton Racket', 'li-ning-carbon-badminton-racket', 'Ultra lightweight carbon fiber frame for enhanced speed. Built-in T-joint technology for improved stability.', 'Weight: 77g (5U) | Flex: Medium | Frame: High Modulous Carbon | String: BG65', 9500.00, 8200.00, 20, 3, 'Li-Ning', '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"]', 4.5, 43, 112, FALSE, FALSE, TRUE, FALSE),
('Resistance Band Set Heavy Duty', 'resistance-band-set-heavy-duty', 'Complete 5-band resistance set for full body workouts. Latex bands with foam handles and ankle straps included.', 'Bands: 5 levels | Resistance: 10-150lbs | Material: Latex | Includes: Handles, Ankle Straps, Door Anchor', 2200.00, 1800.00, 100, 5, 'FitPro', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]', 4.3, 89, 345, FALSE, TRUE, TRUE, FALSE),
('Nike Dri-FIT Sports Bag', 'nike-dri-fit-sports-bag', 'Spacious duffel bag with ventilated shoe compartment and multiple pockets for organized storage.', 'Capacity: 60L | Material: 100% Polyester | Dimensions: 70x35x30cm | Features: Shoe compartment, Water holder', 4500.00, 3800.00, 35, 7, 'Nike', '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"]', 4.6, 201, 678, FALSE, FALSE, FALSE, TRUE),
('Puma Evospeed Football Studs', 'puma-evospeed-football-studs', 'Designed for speed and agility on natural grass. evoKNIT sock collar for secure fit and flexibility.', 'Upper: evoKNIT | Outsole: GRP | Stud Type: FG | Weight: 185g | Sizes: 6-12', 9800.00, 8500.00, 22, 2, 'Puma', '["https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800"]', 4.4, 67, 189, FALSE, FALSE, TRUE, FALSE),
('Jump Rope Speed Cable Pro', 'jump-rope-speed-cable-pro', 'Professional speed jump rope with ball bearings for smooth rotation. Adjustable cable for all heights.', 'Length: Adjustable 3m | Handles: Aluminum | Bearings: Ball | Cable: PVC coated steel | Weight: 180g', 1500.00, 1200.00, 80, 5, 'RopeKing', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]', 4.5, 134, 890, FALSE, TRUE, FALSE, FALSE),
('Puma Running Sneakers RS-X3', 'puma-rs-x3-running-sneakers', 'Retro styled running sneaker with RS foam technology for ultimate cushioning and street-ready style.', 'Upper: Mesh + Leather | Midsole: RS-Foam | Outsole: Rubber | Lacing: Standard | Drop: 8mm', 11500.00, 9999.00, 18, 6, 'Puma', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]', 4.6, 89, 234, FALSE, FALSE, FALSE, FALSE),
('Cricket Batting Helmet Pro', 'cricket-batting-helmet-pro', 'ABS outer shell with ventilation grille. Soft foam inner padding for maximum comfort and protection.', 'Shell: ABS Plastic | Padding: High density foam | Grille: Steel | Weight: 680g | Sizes: S/M/L', 4200.00, 3600.00, 35, 1, 'Gray-Nicolls', '["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"]', 4.7, 56, 145, FALSE, FALSE, FALSE, TRUE),
('Yoga Mat Professional 6mm', 'yoga-mat-professional-6mm', 'Non-slip natural rubber yoga mat with alignment lines. Extra thick 6mm for joint protection.', 'Thickness: 6mm | Material: Natural Rubber + TPE | Dimensions: 183x61cm | Weight: 1.5kg | Anti-slip both sides', 3200.00, 2699.00, 60, 5, 'ZenFit', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]', 4.8, 245, 1200, FALSE, FALSE, TRUE, TRUE);

-- Sample reviews
INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES
(1, 2, 'John Doe', 5, 'Excellent bat! Great pickup weight and the edges are massive. Performed brilliantly in matches.'),
(1, NULL, 'Ahmed Ali', 4, 'Good quality bat, the sweet spot is well positioned. Slightly expensive but worth it.'),
(3, 2, 'John Doe', 5, 'Best racket I have ever used. The control and power balance is outstanding for net play.'),
(5, NULL, 'Fatima K', 5, 'Amazing dumbbell set! Saved so much space compared to my old dumbbells. Worth every rupee.'),
(6, 2, 'John Doe', 5, 'These shoes are incredibly comfortable for long runs. The Boost cushioning is unlike anything else.'),
(6, NULL, 'Rahul S', 4, 'Great shoes, true to size. Very responsive sole. Shipping was fast too.');
