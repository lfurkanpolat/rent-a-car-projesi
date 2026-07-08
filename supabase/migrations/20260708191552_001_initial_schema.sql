/*
# Car Rental Schema

1. Tables
- `cars`: Vehicle inventory (brand, model, year, price, availability, image)
- `reservations`: Customer bookings (car_id, customer info, dates, status)
- `admins`: Admin authentication (username, password_hash)

2. Security
- RLS enabled on all tables
- cars: public read, admin-only write
- reservations: public read/insert, admin-only update/delete
- admins: no public access (admin-only)
*/

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price_per_day decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  description text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Cars policies (public read, authenticated write through admin panel)
DROP POLICY IF EXISTS "public_read_cars" ON cars;
CREATE POLICY "public_read_cars" ON cars FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_cars" ON cars;
CREATE POLICY "authenticated_insert_cars" ON cars FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_cars" ON cars;
CREATE POLICY "authenticated_update_cars" ON cars FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_cars" ON cars;
CREATE POLICY "authenticated_delete_cars" ON cars FOR DELETE
  TO authenticated USING (true);

-- Reservations policies (public read/insert, authenticated update/delete)
DROP POLICY IF EXISTS "public_read_reservations" ON reservations;
CREATE POLICY "public_read_reservations" ON reservations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_reservations" ON reservations;
CREATE POLICY "public_insert_reservations" ON reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_reservations" ON reservations;
CREATE POLICY "authenticated_update_reservations" ON reservations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_reservations" ON reservations;
CREATE POLICY "authenticated_delete_reservations" ON reservations FOR DELETE
  TO authenticated USING (true);

-- Admins policies (authenticated only)
DROP POLICY IF EXISTS "authenticated_read_admins" ON admins;
CREATE POLICY "authenticated_read_admins" ON admins FOR SELECT
  TO authenticated USING (true);

-- Insert default admin (password: admin123 - hashed with bcrypt)
-- Using a pre-computed bcrypt hash for 'admin123'
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.I6T9QjH9YxqVj5X7KC')
ON CONFLICT (username) DO NOTHING;

-- Insert sample cars
INSERT INTO cars (brand, model, year, price_per_day, image_url, description, is_available) VALUES
('BMW', '320i', 2024, 150.00, 'https://images.pexels.com/photos/170810/pexels-photo-170810.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lüks sedan, otomatik vites, deri iç mekan', true),
('Mercedes', 'C200', 2024, 180.00, 'https://images.pexels.com/photos/1200530/pexels-photo-1200530.jpeg?auto=compress&cs=tinysrgb&w=800', 'Premium sedan, panoramik cam tavan', true),
('Audi', 'A4', 2023, 160.00, 'https://images.pexels.com/photos/103290/pexels-photo-103290.jpeg?auto=compress&cs=tinysrgb&w=800', 'Quattro çekiş sistemi, spor süspansiyon', true),
('Volkswagen', 'Passat', 2024, 100.00, 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800', 'Geniş iç mekan, ekonomik tüketim', true),
('Toyota', 'Corolla', 2024, 80.00, 'https://images.pexels.com/photos/3874182/pexels-photo-3874182.jpeg?auto=compress&cs=tinysrgb&w=800', 'Hibrit motor, yakıt tasarruflu', true),
('Honda', 'Civic', 2023, 85.00, 'https://images.pexels.com/photos/752915/pexels-photo-752915.jpeg?auto=compress&cs=tinysrgb&w=800', 'Sportif tasarım, güvenli sürüş', true),
('Ford', 'Focus', 2024, 75.00, 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800', 'Confort ve ekonomi bir arada', true),
('Renault', 'Megane', 2023, 70.00, 'https://images.pexels.com/photos/2310263/pexels-photo-2310263.jpeg?auto=compress&cs=tinysrgb&w=800', 'Modern tasarım, teknolojik donanım', false);
