-- Add visibility and status columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visible_in_listing BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_visible_listing ON posts(visible_in_listing);
CREATE INDEX IF NOT EXISTS idx_posts_published_visible ON posts(published, visible_in_listing);

-- Update existing posts to have proper status
UPDATE posts SET status = 'published' WHERE status IS NULL;
