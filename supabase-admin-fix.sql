-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON admin_users;

-- Create a simpler approach using a function that bypasses RLS
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies that don't cause recursion
-- Allow users to see if they themselves are admins
CREATE POLICY "Users can check own admin status" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- Allow service role to manage admin users (for server-side operations)
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to view all admin users (using the function)
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (is_admin_user());

-- Allow admins to add new admins (using the function)
CREATE POLICY "Admins can add admin users" ON admin_users
  FOR INSERT WITH CHECK (is_admin_user());
