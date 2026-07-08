import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
  created_at: string;
};

export type Reservation = {
  id: string;
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  cars?: Car;
};

export type Admin = {
  id: string;
  username: string;
  created_at: string;
};
