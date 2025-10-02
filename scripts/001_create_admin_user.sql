-- Create admin user in profiles table
INSERT INTO profiles (
  id,
  username,
  first_name,
  last_name,
  role,
  credits,
  has_infinite_credits,
  password_changed,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'Administrador',
  'Sistema',
  'admin',
  0,
  true,
  true,
  now(),
  now()
) ON CONFLICT (username) DO NOTHING;
