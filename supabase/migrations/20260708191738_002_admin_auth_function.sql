/*
# Admin Password Verification Function

1. Functions
- `verify_admin_password`: Verifies admin credentials using bcrypt
- Returns true if credentials match, false otherwise

2. Security
- Uses bcrypt password hashing
- Prevents SQL injection via parameterized queries
*/

CREATE OR REPLACE FUNCTION verify_admin_password(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_password_hash text;
BEGIN
  SELECT password_hash INTO v_password_hash FROM admins WHERE username = p_username;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Simple password check for demo purposes
  -- In production, use proper bcrypt verification via edge function
  RETURN v_password_hash = crypt(p_password, v_password_hash);
END;
$$;

-- Enable pgcrypto extension for crypt function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update admin password hash with proper bcrypt format
UPDATE admins SET password_hash = crypt('admin123', gen_salt('bf')) WHERE username = 'admin';
