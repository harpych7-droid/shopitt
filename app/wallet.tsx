import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTransactions, fetchWalletBalance, WalletTransaction } from '@/services/walletService';

type TxType = 'earning' | 'payout' | 'deposit' | 'refund';

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  { id: '1', user_id: '', type: 'earning', label: 'Order Earning', sublabel: 'Air Jordan 1 · #SHP-2025001', amount: 1800, reference: null, created_at: new Date().toISOString() },
  { id: '2', user_id: '', type: 'earning', label: 'Order Earning', sublabel: 'Oversized Hoodie · #SHP-2025002', amount: 900, reference: null, created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: '3', user_id: '', type: 'payout', label: 'Withdrawal', sublabel: 'Airtel Money · 0971 234 567', amount: 5000, reference: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', user_id: '', type: 'earning', label: 'Order Earning', sublabel: 'Nike Dunk Low · #SHP-2025003', amount: 1200, reference: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', user_id: '', type: 'deposit', label: 'Top Up', sublabel: 'MTN Money · 0961 555 987', amount: 10000, reference: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '6', user_id: '', type: 'payout', label: 'Withdrawal', sublabel: 'Zanaco Bank Account', amount: 8000, reference: null, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '7', user_id: '', type: 'refund', label: 'Refund Issued', sublabel: 'Bridal Package · cancelled', amount: 800, reference: null, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const TX_FILTERS = ['All', 'Earnings', 'Payouts', 'Deposits'];

const TX_ICONS: Record<TxType, { icon: any; color: string; bg: string }> = {
  earning: { icon: 'trending-up', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  payout: { icon: 'arrow-up-right', color: '#FF4DA6', bg: 'rgba(255,77,166,0.12)' },
  deposit: { icon: 'plus', color: '#7B5CFF', bg: 'rgba(123,92,255,0.12)' },
  refund: { icon: 'rotate-ccw', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return `Today, ${Math.round(diff / 3600000)}h ago`;
  if (diff < 86400000 * 2) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TRANSACTIONS);
  const [balance, setBalance] = useState(49100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchTransactions(user.id),
      fetchWalletBalance(user.id),
    ]).then(([txRes, bal]) => {
      if (txRes.data && txRes.data.length > 0) setTransactions(txRes.data);
      if (bal > 0) setBalance(bal);
    }).finally(() => setLoading(false));
  }, [user]);

  const filteredTx = transactions.filter(tx => {
    if (filter === 'All') return true;
    if (filter === 'Earnings') return tx.type === 'earning';
    if (filter === 'Payouts') return tx.type === 'payout';
    if (filter === 'Deposits') return tx.type === 'deposit';
    return true;
  });

  const earnings = transactions.filter(t => t.type === 'earning' || t.type === 'deposit').reduce((a, t) => a + t.amount, 0);
  const withdrawn = transactions.filter(t => t.type === 'payout').reduce((a, t) => a + t.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Pressable hitSlop={8}>
          <Feather name="help-circle" size={22} color={Colors.textSubtle} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ─── BALANCE CARD ─── */}
        <View style={styles.balanceCardWrap}>
          <LinearGradient colors={['#FF4DA6', '#A855F7', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>K {balance.toLocaleString()}</Text>
            <Text style={styles.balanceSub}>Updated just now · Shopitt Wallet</Text>
            <View style={styles.balanceActions}>
              <Pressable style={styles.withdrawBtn}>
                <Feather name="arrow-up-right" size={18} color="#FF4DA6" />
                <Text style={styles.withdrawBtnText}>Withdraw</Text>
              </Pressable>
              <Pressable style={styles.topUpBtn}>
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.topUpBtnText}>Top Up</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* ─── QUICK STATS ─── */}
        <View style={styles.statsRow}>
          {[
            { emoji: '📈', value: `K${(earnings / 1000).toFixed(1)}K`, label: 'This Month', colors: ['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)'] },
            { emoji: '💸', value: `K${(withdrawn / 1000).toFixed(1)}K`, label: 'Withdrawn', colors: ['rgba(255,77,166,0.15)', 'rgba(255,77,166,0.05)'] },
            { emoji: '🛒', value: transactions.filter(t => t.type === 'earning').length.toString(), label: 'Orders', colors: ['rgba(123,92,255,0.15)', 'rgba(123,92,255,0.05)'] },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <LinearGradient colors={s.colors as any} style={styles.statCardGrad}>
                <Text style={styles.statIcon}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* ─── FILTER ─── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {TX_FILTERS.map(f => (
            <Pressable key={f} onPress={() => setFilter(f)}>
              {filter === f ? (
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.filterBtnActive}>
                  <Text style={styles.filterBtnActiveText}>{f}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterBtn}>
                  <Text style={styles.filterBtnText}>{f}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* ─── TRANSACTIONS ─── */}
        <View style={styles.txSection}>
          <Text style={styles.txSectionTitle}>Transaction History</Text>
          {loading ? <ActivityIndicator color="#FF4DA6" style={{ marginVertical: 20 }} /> : null}
          {filteredTx.map(tx => {
            const iconData = TX_ICONS[tx.type];
            const isPositive = tx.type === 'earning' || tx.type === 'deposit';
            return (
              <Pressable key={tx.id} style={({ pressed }) => [styles.txRow, pressed && { opacity: 0.75 }]}>
                <View style={[styles.txIcon, { backgroundColor: iconData.bg }]}>
                  <Feather name={iconData.icon} size={18} color={iconData.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel}>{tx.label}</Text>
                  {tx.sublabel ? <Text style={styles.txSublabel}>{tx.sublabel}</Text> : null}
                  <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isPositive ? '#22C55E' : '#FF4DA6' }]}>
                  {isPositive ? '+' : '-'}K{tx.amount.toLocaleString()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ─── PAYMENT METHODS ─── */}
        <View style={styles.methodsSection}>
          <Text style={styles.txSectionTitle}>Payment Methods</Text>
          {[
            { icon: '📱', name: 'Airtel Money', num: '0971 234 567', verified: true },
            { icon: '📱', name: 'MTN Mobile Money', num: '0961 555 987', verified: true },
            { icon: '🏦', name: 'Zanaco Bank', num: '****4821', verified: false },
          ].map((method, idx) => (
            <Pressable key={idx} style={({ pressed }) => [styles.methodRow, pressed && { opacity: 0.75 }]}>
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodNum}>{method.num}</Text>
              </View>
              {method.verified ? (
                <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>
              ) : (
                <View style={styles.verifyBtn}><Text style={styles.verifyBtnText}>Verify</Text></View>
              )}
            </Pressable>
          ))}
          <Pressable style={styles.addMethodBtn}>
            <Feather name="plus" size={18} color="#7B5CFF" />
            <Text style={styles.addMethodText}>Add Payment Method</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  balanceCardWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  balanceCard: { borderRadius: 24, padding: 28, overflow: 'hidden', position: 'relative' },
  decorCircle1: { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)' },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 44, fontWeight: '900', letterSpacing: -1, marginBottom: 6 },
  balanceSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 24 },
  balanceActions: { flexDirection: 'row', gap: 12 },
  withdrawBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14 },
  withdrawBtnText: { color: '#FF4DA6', fontWeight: '800', fontSize: 15 },
  topUpBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  topUpBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 16, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  statCardGrad: { padding: 14, alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 22 },
  statValue: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  statLabel: { color: Colors.textSubtle, fontSize: 11, fontWeight: '600' },
  filterScroll: { maxHeight: 56 },
  filterContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  filterBtnActive: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
  filterBtnActiveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filterBtn: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  filterBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  txSection: { paddingHorizontal: 16, paddingTop: 16 },
  txSectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txLabel: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  txSublabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  txDate: { color: Colors.textSubtle, fontSize: 11, marginTop: 3 },
  txAmount: { fontWeight: '800', fontSize: 15 },
  methodsSection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  methodIcon: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  methodNum: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  verifiedBadge: { backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  verifiedText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  verifyBtn: { backgroundColor: 'rgba(123,92,255,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(123,92,255,0.3)' },
  verifyBtnText: { color: '#7B5CFF', fontSize: 12, fontWeight: '700' },
  addMethodBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#7B5CFF', marginTop: 4 },
  addMethodText: { color: '#7B5CFF', fontWeight: '700', fontSize: 14 },
});
