-- Supabase SQL Schema for Weight Calendar App
-- Run this in your Supabase SQL Editor

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  target_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight Records Table
CREATE TABLE IF NOT EXISTS weight_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  weight DECIMAL(5,2) NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster date queries
CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(date);

-- Insert default settings row
INSERT INTO settings (id, target_weight, height)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
-- API Routes use service_role key which bypasses RLS
-- This blocks all direct access via anon key
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

-- No policies = all direct access blocked (service_role bypasses RLS)
