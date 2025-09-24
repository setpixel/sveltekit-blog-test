-- Add performance indexes to existing posts table
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);

-- Add a published status column for better filtering
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- Add excerpt column to avoid fetching full content for lists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts(published, created_at DESC);

-- Update existing posts to have excerpt (first 200 chars of content)
UPDATE posts SET excerpt = LEFT(content, 200) WHERE excerpt IS NULL;
