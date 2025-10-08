-- MindMap Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor

-- Create mindmaps table
CREATE TABLE IF NOT EXISTS mindmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  content TEXT DEFAULT '',
  structure JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on updated_at for faster queries
CREATE INDEX IF NOT EXISTS idx_mindmaps_updated_at ON mindmaps(updated_at DESC);

-- Create an index on name and description for search functionality
CREATE INDEX IF NOT EXISTS idx_mindmaps_search ON mindmaps USING gin(to_tsvector('english', name || ' ' || description));

-- Enable Row Level Security (RLS)
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- For now, we'll allow all operations for anonymous users too
-- You can modify this based on your authentication requirements
CREATE POLICY "Allow all operations for all users" ON mindmaps
  FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_mindmaps_updated_at
  BEFORE UPDATE ON mindmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a function to search mindmaps
CREATE OR REPLACE FUNCTION search_mindmaps(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  content TEXT,
  structure JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.description,
    m.content,
    m.structure,
    m.created_at,
    m.updated_at,
    ts_rank(to_tsvector('english', m.name || ' ' || m.description || ' ' || m.content), plainto_tsquery('english', search_term)) as rank
  FROM mindmaps m
  WHERE to_tsvector('english', m.name || ' ' || m.description || ' ' || m.content) @@ plainto_tsquery('english', search_term)
  ORDER BY rank DESC, m.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
