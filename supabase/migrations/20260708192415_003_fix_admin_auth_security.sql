/*
# Fix Admin Auth Function Security

1. Changes
- Set function to SECURITY DEFINER so it runs with function owner privileges
- This allows anon key to call the function without RLS blocking
*/

CREATE OR REPLACE FUNCTION verify_admin_password(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash text;
BEGIN
  SELECT password_hash INTO v_password_hash FROM admins WHERE username = p_username;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN v_password_hash = crypt(p_password, v_password_hash);
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION verify_admin_password(text, text) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(text, text) TO authenticated;
