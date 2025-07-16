-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE livestock_db;

-- Connect to livestock_db and run the following:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kandang (Pen) table
CREATE TABLE IF NOT EXISTS kandang (
  id_kandang UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kandang VARCHAR(255) NOT NULL,
  added_date TIMESTAMPTZ DEFAULT NOW()
);

-- Vaksin (Vaccine) table  
CREATE TABLE IF NOT EXISTS vaksin (
  id_vaksin UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_vaksin VARCHAR(255) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kambing (Goat) table
CREATE TABLE IF NOT EXISTS kambing (
  id_kambing UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keturunan VARCHAR(255) NOT NULL,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  vaksin_id UUID REFERENCES vaksin(id_vaksin),
  kandang_id UUID REFERENCES kandang(id_kandang),
  image_path VARCHAR(500)
);

-- Vaksinisasi (Vaccination) table
CREATE TABLE IF NOT EXISTS vaksinisasi (
  id_vaksinisasi UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_kambing UUID REFERENCES kambing(id_kambing) NOT NULL,
  id_vaksin UUID REFERENCES vaksin(id_vaksin) NOT NULL,
  dosis_vaksin VARCHAR(255) NOT NULL,
  vaksin_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gate Kandang (Pen Gate) table
CREATE TABLE IF NOT EXISTS gate_kandang (
  id_gate UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_kandang UUID REFERENCES kandang(id_kandang) NOT NULL,
  id_kambing UUID REFERENCES kambing(id_kambing) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Masuk', 'Keluar')),
  datetime TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kambing_kandang_id ON kambing(kandang_id);
CREATE INDEX IF NOT EXISTS idx_kambing_vaksin_id ON kambing(vaksin_id);
CREATE INDEX IF NOT EXISTS idx_vaksinisasi_kambing_id ON vaksinisasi(id_kambing);
CREATE INDEX IF NOT EXISTS idx_vaksinisasi_vaksin_id ON vaksinisasi(id_vaksin);
CREATE INDEX IF NOT EXISTS idx_gate_kandang_kandang_id ON gate_kandang(id_kandang);
CREATE INDEX IF NOT EXISTS idx_gate_kandang_kambing_id ON gate_kandang(id_kambing);

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id_user, username, password, role) 
VALUES (
  uuid_generate_v4(), 
  'admin', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'Admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample data
INSERT INTO kandang (id_kandang, nama_kandang) VALUES 
  (uuid_generate_v4(), 'Kandang A'),
  (uuid_generate_v4(), 'Kandang B'),
  (uuid_generate_v4(), 'Kandang C')
ON CONFLICT DO NOTHING;

INSERT INTO vaksin (id_vaksin, nama_vaksin) VALUES 
  (uuid_generate_v4(), 'Vaksin Anthrax'),
  (uuid_generate_v4(), 'Vaksin SE'),
  (uuid_generate_v4(), 'Vaksin PMK'),
  (uuid_generate_v4(), 'Vaksin Brucellosis')
ON CONFLICT DO NOTHING;



/*
  # Add display_id column to kambing table

  1. Changes
    - Add `display_id` column to kambing table for human-readable IDs
    - Keep `id_kambing` as UUID primary key for database relationships
    - Add unique constraint on `display_id`
    - Update existing records with generated display IDs

  2. Migration Details
    - Adds display_id VARCHAR(50) column
    - Creates unique index on display_id
    - Generates display IDs for existing records
*/

-- Add display_id column to kambing table
ALTER TABLE kambing ADD COLUMN IF NOT EXISTS display_id VARCHAR(50);

-- Create unique index on display_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_kambing_display_id ON kambing(display_id);

-- Function to generate display ID
CREATE OR REPLACE FUNCTION generate_kambing_display_id() RETURNS VARCHAR(50) AS $$
DECLARE
    numbers VARCHAR(2);
    letters VARCHAR(2);
    date_str VARCHAR(8);
    display_id VARCHAR(50);
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate 2 random numbers (00-99)
        numbers := LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0');
        
        -- Generate 2 random uppercase letters
        letters := CHR(65 + (RANDOM() * 25)::INTEGER) || CHR(65 + (RANDOM() * 25)::INTEGER);
        
        -- Get current date in DDMMYYYY format
        date_str := TO_CHAR(NOW(), 'DDMMYYYY');
        
        -- Combine to create display ID
        display_id := numbers || letters || date_str;
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM kambing WHERE display_id = display_id) THEN
            RETURN display_id;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback: add random suffix if we can't generate unique ID
            display_id := display_id || '_' || (RANDOM() * 999)::INTEGER::TEXT;
            RETURN display_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with generated display IDs
UPDATE kambing 
SET display_id = generate_kambing_display_id() 
WHERE display_id IS NULL;

-- Make display_id NOT NULL after updating existing records
ALTER TABLE kambing ALTER COLUMN display_id SET NOT NULL;

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS generate_kambing_display_id();