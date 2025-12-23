/**
 * Supabase Database Types for AutoVault
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    wallet_address: string;
                    email: string | null;
                    created_at: string;
                    settings: Json;
                };
                Insert: {
                    id?: string;
                    wallet_address: string;
                    email?: string | null;
                    created_at?: string;
                    settings?: Json;
                };
                Update: {
                    id?: string;
                    wallet_address?: string;
                    email?: string | null;
                    created_at?: string;
                    settings?: Json;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    tx_hash: string;
                    type: 'deposit' | 'withdrawal' | 'dca' | 'goal_deposit' | 'goal_withdraw';
                    amount: number;
                    bucket_id: number | null;
                    goal_id: number | null;
                    strategy_id: number | null;
                    status: 'pending' | 'confirmed' | 'failed';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    tx_hash: string;
                    type: 'deposit' | 'withdrawal' | 'dca' | 'goal_deposit' | 'goal_withdraw';
                    amount: number;
                    bucket_id?: number | null;
                    goal_id?: number | null;
                    strategy_id?: number | null;
                    status: 'pending' | 'confirmed' | 'failed';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    tx_hash?: string;
                    type?: 'deposit' | 'withdrawal' | 'dca' | 'goal_deposit' | 'goal_withdraw';
                    amount?: number;
                    bucket_id?: number | null;
                    goal_id?: number | null;
                    strategy_id?: number | null;
                    status?: 'pending' | 'confirmed' | 'failed';
                    created_at?: string;
                };
            };
            ai_conversations: {
                Row: {
                    id: string;
                    user_id: string;
                    messages: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    messages: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    messages?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

// Helper types
export type User = Database['public']['Tables']['users']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];

export type TransactionType = Transaction['type'];
export type TransactionStatus = Transaction['status'];
