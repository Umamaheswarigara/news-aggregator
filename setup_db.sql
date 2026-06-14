-- PostgreSQL Schema for News Aggregation and Reading Platform

-- Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER', -- 'USER' or 'ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_id INT REFERENCES sources(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE(user_id, article_id)
);

-- Seed Categories
INSERT INTO categories (category_name) VALUES 
('Technology'),
('Sports'),
('Business'),
('Health'),
('Science'),
('Entertainment'),
('Politics')
ON CONFLICT (category_name) DO NOTHING;

-- Seed Sources
INSERT INTO sources (source_name, website) VALUES 
('BBC', 'https://www.bbc.com'),
('CNN', 'https://edition.cnn.com'),
('TOI', 'https://timesofindia.indiatimes.com'),
('TechCrunch', 'https://techcrunch.com'),
('NDTV', 'https://www.ndtv.com')
ON CONFLICT (source_name) DO NOTHING;
