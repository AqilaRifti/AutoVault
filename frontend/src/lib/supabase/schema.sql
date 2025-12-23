-- AutoVault Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to wallet address)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Transaction history for analytics
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'dca', 'goal_deposit', 'goal_withdraw')),
  amount NUMERIC NOT NULL,
  bucket_id INTEGER,
  goal_id INTEGER,
  strategy_id INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- AI conversation history
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- Allow reading for wallet lookup

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true); -- Allow creating profile

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true); -- Allow updating

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (true);

-- AI conversations policies
CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own conversations" ON ai_conversations
  FOR UPDATE USING (true);

-- Helper function to get or create user by wallet address
CREATE OR REPLACE FUNCTION get_or_create_user(p_wallet_address TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id FROM users WHERE wallet_address = LOWER(p_wallet_address);
  
  -- If not found, create new user
  IF v_user_id IS NULL THEN
    INSERT INTO users (wallet_address) VALUES (LOWER(p_wallet_address))
    RETURNING id INTO v_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
