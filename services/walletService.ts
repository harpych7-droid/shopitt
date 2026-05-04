import { supabase } from '@/lib/supabase';

// Uses the `wallets` table (balance, available_balance, pending_balance)
// and `transactions` table (type, transaction_type, amount, currency, status, metadata)

export interface WalletBalance {
  balance: number;
  available_balance: number;
  pending_balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: string;
  transaction_type: string;
  amount: number;
  currency: string;
  wallet_bucket: string | null;
  status: string;
  reference: string | null;
  order_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  completed_at: string | null;
}

export async function fetchWalletBalance(userId: string): Promise<WalletBalance> {
  const { data } = await supabase
    .from('wallets')
    .select('balance, available_balance, pending_balance, currency')
    .eq('user_id', userId)
    .single();

  return {
    balance:           data?.balance ?? 0,
    available_balance: data?.available_balance ?? 0,
    pending_balance:   data?.pending_balance ?? 0,
    currency:          data?.currency ?? 'USD',
  };
}

export async function fetchTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: null, error: error.message };
  return { data: data as WalletTransaction[], error: null };
}

export async function requestWithdrawal(userId: string, amount: number, currency: string) {
  try {
    const { data, error } = await supabase.rpc('request_wallet_withdrawal', {
      p_user_id: userId,
      p_amount: amount,
      p_currency: currency,
    });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message ?? 'Withdrawal failed' };
  }
}
