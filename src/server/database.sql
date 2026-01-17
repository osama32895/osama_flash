
CREATE DATABASE IF NOT EXISTS osama_flash;
USE osama_flash;

-- Items Table
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('App', 'Game', 'Driver') NOT NULL,
    icon TEXT,
    rating FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,
    downloads INT DEFAULT 0,
    release_date DATE,
    description TEXT,
    url TEXT,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0
);

-- Stats Table (Single Row)
CREATE TABLE IF NOT EXISTS stats (
    id INT PRIMARY KEY DEFAULT 1,
    visitors BIGINT DEFAULT 0,
    total_downloads BIGINT DEFAULT 0
);

-- Config Table (Single Row)
CREATE TABLE IF NOT EXISTS config (
    id INT PRIMARY KEY DEFAULT 1,
    admin_pass VARCHAR(255) DEFAULT '2006',
    site_title VARCHAR(255) DEFAULT 'Osama Flash',
    about_content LONGTEXT
);

-- Seed Data (Run only once)
INSERT IGNORE INTO stats (id, visitors, total_downloads) VALUES (1, 12000, 500000);
INSERT IGNORE INTO config (id, admin_pass, site_title, about_content) VALUES (
    1, 
    '2006', 
    'Osama Flash', 
    '<h1 class="text-3xl font-bold text-white mb-2">About Osama</h1><p>Welcome to the official repository.</p>'
);
