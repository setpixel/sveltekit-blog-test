-- Create admin_users table to track who can create posts
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view the admin_users table
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only existing admins can add new admins
CREATE POLICY "Admins can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update posts policies to use admin check
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Only admins can create posts" ON posts
    FOR INSERT WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Admins can update their own posts" ON posts
    FOR UPDATE USING (is_admin_user() AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Admins can delete their own posts" ON posts
    FOR DELETE USING (is_admin_user() AND auth.uid() = author_id);

-- Insert your first admin user (replace with your actual user ID and email)
-- You'll need to get your user ID from auth.users table first
-- INSERT INTO admin_users (user_id, email) VALUES ('your-user-id-here', 'your-email@example.com');
