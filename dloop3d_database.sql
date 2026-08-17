-- ============================================================================
-- D LOOP 3D — COMPLETE PRODUCTION DATABASE SCHEMA & SEED DATA
-- Specialized FDM 3D Printing Studio & Filament Store
-- Compatible with MySQL (8.0+), MariaDB, PostgreSQL, & SQLite
-- ============================================================================

-- Create Database (Optional, for MySQL/PostgreSQL environments)
-- CREATE DATABASE IF NOT EXISTS dloop3d_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE dloop3d_db;

-- ----------------------------------------------------------------------------
-- 1. USERS & CUSTOMER ACCOUNTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'operator') DEFAULT 'customer',
    door_no VARCHAR(255) DEFAULT NULL,
    street VARCHAR(255) DEFAULT NULL,
    area VARCHAR(255) DEFAULT NULL,
    city VARCHAR(128) DEFAULT 'Chennai',
    state VARCHAR(128) DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10) DEFAULT NULL,
    full_address TEXT DEFAULT NULL,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for fast customer email and phone lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ----------------------------------------------------------------------------
-- 2. FILAMENT INVENTORY & 52-COLOR LIVE STOCK TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS filament_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,            -- e.g. fil-pla-std, fil-petg-pro, fil-petgcf
    color_name VARCHAR(128) NOT NULL,            -- e.g. Pitch Black, Ivory White, Signal Red
    category VARCHAR(64) NOT NULL,              -- PLA, PLA Matte, PETG, PETG-CF, ASA, PA12-CF, PA12, Silk PLA, PLA Special, ABS-FR, ABS
    color_hex VARCHAR(16) NOT NULL,             -- e.g. #121212, #FDFBF7, #EF4444
    price DECIMAL(10, 2) NOT NULL DEFAULT 810.00,
    balance_grams INT NOT NULL DEFAULT 10000,   -- Live balance in grams
    spool_weight_grams INT NOT NULL DEFAULT 1000,
    reorder_level_grams INT NOT NULL DEFAULT 3000,
    diameter_mm DECIMAL(4, 2) NOT NULL DEFAULT 1.75,
    recommended_temp_nozzle VARCHAR(32) DEFAULT '200-220°C',
    recommended_temp_bed VARCHAR(32) DEFAULT '50-60°C',
    status ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_filament_color (product_id, color_name)
);

CREATE INDEX idx_filament_category ON filament_catalog(category);
CREATE INDEX idx_filament_status ON filament_catalog(status);

-- ----------------------------------------------------------------------------
-- 3. READY-TO-SHIP 3D PRODUCTS & CUSTOM PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,                 -- e.g. prod-101, prod-102
    sku VARCHAR(64) NOT NULL UNIQUE,            -- e.g. DL3D-T-01, DL3D-D-02
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,             -- 3D Printed Toys, Mobile & Desk Stands, Fidget & Art, Home Decor
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2) DEFAULT NULL,
    stock_qty INT NOT NULL DEFAULT 15,
    description TEXT NOT NULL,
    images JSON NOT NULL,                       -- Array of 1-6 image URLs ['url1', 'url2']
    specs JSON DEFAULT NULL,                    -- JSON Key-Value pairs: {"Material":"PLA+", "Layer Height":"0.16mm"}
    highlights JSON DEFAULT NULL,               -- JSON Array: ["Ultra Durable", "Zero Assembly"]
    warranty VARCHAR(255) DEFAULT '1-Year Replacement Warranty for any layer separation or snapping defect',
    in_the_box VARCHAR(255) DEFAULT '1x 3D Printed Finished Product, Certificate of Authenticity, Care Card',
    status ENUM('active', 'out_of_stock', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- ----------------------------------------------------------------------------
-- 4. CUSTOMER ORDERS & SHIPROCKET DISPATCH TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,       -- e.g. DL3D-84920
    user_id VARCHAR(64) DEFAULT NULL,           -- Foreign key to users.id (if logged in)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    delivery_method ENUM('courier', 'pickup') NOT NULL DEFAULT 'courier',
    delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    shipping_door_no VARCHAR(255) DEFAULT NULL,
    shipping_street VARCHAR(255) DEFAULT NULL,
    shipping_area VARCHAR(255) DEFAULT NULL,
    shipping_city VARCHAR(128) NOT NULL DEFAULT 'Chennai',
    shipping_pincode VARCHAR(10) NOT NULL,
    shipping_full_address TEXT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('upi', 'card', 'cod', 'cash') NOT NULL DEFAULT 'upi',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    order_status ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'new',
    awb VARCHAR(64) DEFAULT NULL,               -- Shiprocket AWB tracking number
    courier_name VARCHAR(128) DEFAULT NULL,     -- e.g. Delhivery Surface, Bluedart Air Express
    shipment_id VARCHAR(64) DEFAULT NULL,       -- Shiprocket shipment ID
    tracking_url VARCHAR(512) DEFAULT NULL,     -- https://shiprocket.co/tracking/{awb}
    dispatched_at TIMESTAMP NULL DEFAULT NULL,
    delivered_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_awb ON orders(awb);

-- ----------------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE (Line Items for Each Order)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) DEFAULT NULL,
    item_name VARCHAR(255) NOT NULL,
    details VARCHAR(255) DEFAULT NULL,          -- e.g. Color: Pitch Black, Infill: 20%
    is_custom_stl BOOLEAN DEFAULT FALSE,
    stl_file_name VARCHAR(255) DEFAULT NULL,
    stl_file_data LONGTEXT DEFAULT NULL,        -- Base64 or Data URL for custom 3D models
    filament_product_id VARCHAR(64) DEFAULT NULL,
    filament_color_name VARCHAR(128) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ----------------------------------------------------------------------------
-- 6. CUSTOM 3D PRINT INSTANT QUOTES & STL UPLOADS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quote_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id VARCHAR(64) NOT NULL UNIQUE,       -- e.g. Q-82910
    user_id VARCHAR(64) DEFAULT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_mb DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    volume_cm3 DECIMAL(10, 2) DEFAULT NULL,
    dimensions_xyz VARCHAR(64) DEFAULT NULL,    -- e.g. 100 x 50 x 25 mm
    material VARCHAR(64) NOT NULL DEFAULT 'PLA Standard',
    color VARCHAR(64) NOT NULL DEFAULT 'Pitch Black',
    layer_height VARCHAR(32) NOT NULL DEFAULT '0.20mm (Standard)',
    infill_percent INT NOT NULL DEFAULT 20,
    estimated_weight_grams INT NOT NULL DEFAULT 45,
    estimated_print_time_hours DECIMAL(6, 2) NOT NULL DEFAULT 3.5,
    estimated_price DECIMAL(10, 2) NOT NULL DEFAULT 350.00,
    special_instructions TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'converted_to_order', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 7. SHIPROCKET LOGISTICS CONFIGURATION & API SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shiprocket_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_email VARCHAR(255) NOT NULL,
    api_password_hash VARCHAR(255) NOT NULL,
    auth_token TEXT DEFAULT NULL,
    token_expires_at TIMESTAMP NULL DEFAULT NULL,
    pickup_pincode VARCHAR(10) NOT NULL DEFAULT '600095',
    pickup_location_name VARCHAR(128) NOT NULL DEFAULT 'D Loop 3D Studio Maduravoyal',
    pickup_address TEXT DEFAULT 'No. 25, 3rd Cross Street, Ganga Nagar, Maduravoyal, Chennai, Tamil Nadu - 600095',
    default_courier VARCHAR(128) NOT NULL DEFAULT 'Delhivery Surface',
    auto_dispatch_enabled BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. PRODUCT REVIEWS & TESTIMONIALS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_location VARCHAR(128) DEFAULT 'Chennai',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA: 52 OFFICIAL FILAMENT CATALOG ENTRIES
-- ============================================================================
INSERT INTO filament_catalog (product_id, color_name, category, color_hex, price, balance_grams, reorder_level_grams) VALUES
-- 1. High-Speed PLA (22 Colors)
('fil-pla-std', 'Pitch Black', 'PLA', '#121212', 810.00, 14000, 5000),
('fil-pla-std', 'Ivory White', 'PLA', '#FDFBF7', 810.00, 8000, 3000),
('fil-pla-std', 'Bone White', 'PLA', '#F4EFEB', 810.00, 6000, 3000),
('fil-pla-std', 'Pure White', 'PLA', '#FFFFFF', 810.00, 25000, 5000),
('fil-pla-std', 'Light Beige', 'PLA', '#E8D8C8', 810.00, 5000, 2000),
('fil-pla-std', 'Dark Gray', 'PLA', '#4A4E51', 810.00, 11000, 3000),
('fil-pla-std', 'Light Gray', 'PLA', '#D3D3D3', 810.00, 12000, 3000),
('fil-pla-std', 'Signal Red', 'PLA', '#EF4444', 810.00, 10000, 4000),
('fil-pla-std', 'Fire Red', 'PLA', '#DC2626', 810.00, 9000, 3000),
('fil-pla-std', 'Coral Orange', 'PLA', '#FF7F50', 810.00, 7000, 2000),
('fil-pla-std', 'Sunset Orange', 'PLA', '#F97316', 810.00, 8000, 2000),
('fil-pla-std', 'Sunflower Yellow', 'PLA', '#EAB308', 810.00, 7000, 2000),
('fil-pla-std', 'Forest Green', 'PLA', '#15803D', 810.00, 9000, 3000),
('fil-pla-std', 'Olive Green', 'PLA', '#556B2F', 810.00, 4000, 2000),
('fil-pla-std', 'Mint Green', 'PLA', '#A7F3D0', 810.00, 6000, 2000),
('fil-pla-std', 'Navy Blue', 'PLA', '#1E3A8A', 810.00, 11000, 3000),
('fil-pla-std', 'Cobalt Blue', 'PLA', '#2563EB', 810.00, 14000, 4000),
('fil-pla-std', 'Sky Blue', 'PLA', '#38BDF8', 810.00, 8000, 2000),
('fil-pla-std', 'Deep Purple', 'PLA', '#6B21A8', 810.00, 5000, 2000),
('fil-pla-std', 'Lavender Purple', 'PLA', '#C084FC', 810.00, 5000, 2000),
('fil-pla-std', 'Hot Pink', 'PLA', '#EC4899', 810.00, 4000, 2000),
('fil-pla-std', 'Chocolate Brown', 'PLA', '#78350F', 810.00, 4000, 2000),

-- 2. PLA Matte Aesthetic (8 Colors)
('fil-pla-matte', 'Matte Charcoal', 'PLA Matte', '#262626', 880.00, 9000, 3000),
('fil-pla-matte', 'Matte Cotton White', 'PLA Matte', '#F8FAFC', 880.00, 12000, 4000),
('fil-pla-matte', 'Matte Ash Gray', 'PLA Matte', '#64748B', 880.00, 7000, 2000),
('fil-pla-matte', 'Matte Terracotta', 'PLA Matte', '#E07A5F', 880.00, 5000, 2000),
('fil-pla-matte', 'Matte Sage Green', 'PLA Matte', '#81B29A', 880.00, 6000, 2000),
('fil-pla-matte', 'Matte Pastel Blue', 'PLA Matte', '#A0C4FF', 880.00, 6000, 2000),
('fil-pla-matte', 'Matte Desert Sand', 'PLA Matte', '#EDC4B3', 880.00, 5000, 2000),
('fil-pla-matte', 'Matte Mustard', 'PLA Matte', '#F4A261', 880.00, 4000, 2000),

-- 3. PETG High Toughness (8 Colors)
('fil-petg-pro', 'PETG Solid Black', 'PETG', '#0F172A', 880.00, 15000, 5000),
('fil-petg-pro', 'PETG Solid White', 'PETG', '#FFFFFF', 880.00, 10000, 4000),
('fil-petg-pro', 'PETG Transparent Clear', 'PETG', '#E2E8F0', 880.00, 12000, 3000),
('fil-petg-pro', 'PETG Translucent Red', 'PETG', '#F87171', 880.00, 5000, 2000),
('fil-petg-pro', 'PETG Translucent Blue', 'PETG', '#60A5FA', 880.00, 6000, 2000),
('fil-petg-pro', 'PETG Steel Gray', 'PETG', '#475569', 880.00, 7000, 2000),
('fil-petg-pro', 'PETG Safety Orange', 'PETG', '#FB923C', 880.00, 6000, 2000),
('fil-petg-pro', 'PETG Emerald Green', 'PETG', '#10B981', 880.00, 5000, 2000),

-- 4. Engineering & Carbon Fiber Series (14 Colors)
('fil-petgcf', 'PETG Carbon Fiber Black', 'PETG-CF', '#1E293B', 1450.00, 8000, 3000),
('fil-petgcf', 'PETG Carbon Fiber Dark Gray', 'PETG-CF', '#334155', 1450.00, 6000, 2000),
('fil-pa12cf', 'PA12-CF Industrial Matte Black', 'PA12-CF', '#09090B', 2490.00, 4000, 2000),
('fil-pa12', 'PA12 Pure Nylon Natural', 'PA12', '#F1F5F9', 1890.00, 4000, 2000),
('fil-asa', 'ASA UV-Resistant Black', 'ASA', '#18181B', 1250.00, 7000, 2000),
('fil-asa', 'ASA UV-Resistant Signal White', 'ASA', '#FAFAFA', 1250.00, 6000, 2000),
('fil-asa', 'ASA Outdoor Silver Gray', 'ASA', '#94A3B8', 1250.00, 5000, 2000),
('fil-silk', 'Silk Shiny Gold', 'Silk PLA', '#EAB308', 990.00, 6000, 2000),
('fil-silk', 'Silk Metallic Silver', 'Silk PLA', '#CBD5E1', 990.00, 6000, 2000),
('fil-silk', 'Silk Copper Bronze', 'Silk PLA', '#B45309', 990.00, 4000, 2000),
('fil-spec', 'Marble Stone Texture PLA', 'PLA Special', '#E2E8F0', 990.00, 7000, 2000),
('fil-spec', 'Glow-in-the-Dark Neon Green', 'PLA Special', '#4ADE80', 1090.00, 4000, 2000),
('fil-absfr', 'ABS-FR Flame Retardant V0 Black', 'ABS-FR', '#0F172A', 1390.00, 5000, 2000),
('fil-abs', 'ABS Industrial High Impact White', 'ABS', '#F8FAFC', 920.00, 6000, 2000)
ON DUPLICATE KEY UPDATE balance_grams = VALUES(balance_grams), price = VALUES(price);

-- ============================================================================
-- SEED DATA: READY-TO-SHIP 3D PRODUCTS
-- ============================================================================
INSERT INTO products (id, sku, name, category, price, compare_price, stock_qty, description, images, specs, highlights) VALUES
('prod-101', 'DL3D-T-01', 'Articulated Crystal Dragon (Print-in-Place)', '3D Printed Toys', 499.00, 899.00, 18, 
 'Incredible fully articulated mythical Crystal Dragon crafted with zero-assembly print-in-place joints. Smooth tactile movement and premium dual-color Silk finish.', 
 '["https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"]',
 '{"Material": "High-Speed Silk PLA+", "Joint Type": "Full Print-in-Place Articulation", "Length": "450 mm (17.7 inches)", "Layer Height": "0.16mm Fine Detail"}',
 '["100% Print-in-Place Articulation", "Hypnotic Silk Finish", "Stress-Relief Fidget Toy"]'),

('prod-102', 'DL3D-D-02', 'Adjustable Foldable Phone & Tablet Stand', 'Mobile & Desk Stands', 249.00, 499.00, 35,
 'Ergonomic dual-axis multi-angle phone and tablet holder. Features charging cable pass-through channel and anti-slip ribbed base for maximum desk stability.',
 '["https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"]',
 '{"Material": "PETG Solid Structural", "Angles": "0° to 270° Dual-Axis Pivot", "Device Support": "Smartphones up to 12.9-inch iPad Pro", "Cable Slot": "Integrated 10mm Fast-Charge Routing"}',
 '["Heavy-Duty PETG Construction", "Pocket-Sized Foldable Design", "Universal Device Compatibility"]'),

('prod-103', 'DL3D-F-03', 'Mechanical Infinity Fidget Cube', 'Fidget & Art', 199.00, 399.00, 40,
 'Ultra-satisfying endless folding infinity cube with chamfered smooth edges and high-tolerance precision hinges designed for all-day desk focus and stress relief.',
 '["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80"]',
 '{"Material": "PLA Matte Aesthetic", "Dimensions": "40 x 40 x 40 mm (Folded)", "Hinge Tolerance": "0.2mm Precision Gap", "Sound Profile": "Soft Tactile Snap"}',
 '["Zero Screws / Pure 3D Printed Hinges", "Pocket EDC Focus Tool", "Smooth Matte Finish"]')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price);

-- ============================================================================
-- SEED DATA: SHIPROCKET DEFAULT LOGISTICS CONFIGURATION
-- ============================================================================
INSERT INTO shiprocket_config (api_email, api_password_hash, pickup_pincode, default_courier, auto_dispatch_enabled)
VALUES ('logistics@dloop3d.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '600095', 'Delhivery Surface', TRUE);
