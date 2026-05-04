import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DbOrder, fetchBuyerOrders, updateOrderStatus } from '@/services/ordersService';
import { supabase } from '@/lib/supabase';

const STATUS_STEPS: { key: DbOrder['status']; label: string; icon: string; desc: string }[] = [
  { key: 'pending',   label: 'Order Placed',  icon: 'checkmark-circle-outline', desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed',      icon: 'bag-check-outline',        desc: 'Seller confirmed your order' },
  { key: 'shipped',   label: 'Shipped',        icon: 'car-outline',              desc: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered',      icon: 'home-outline',             desc: 'Order delivered successfully' },
];

const STATUS_WEIGHT: Record<string, number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1,
};

function estimatedDelivery(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function StepDot({ step, currentWeight, index }: { step: typeof STATUS_STEPS[0]; currentWeight: number; index: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isPast    = STATUS_WEIGHT[step.key] <= currentWeight;
  const isActive  = STATUS_WEIGHT[step.key] === currentWeight;

  useEffect(() => {
    if (isPast || isActive) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 150,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }).start();
    }
  }, [isPast, isActive]);

  return (
    <View style={styles.step}>
      {/* Connector line above */}
      {index > 0 ? (
        <View style={[styles.connector, isPast && styles.connectorActive]} />
      ) : null}

      {/* Dot */}
      <Animated.View style={{ transform: [{ scale: isPast || isActive ? scaleAnim : new Animated.Value(1) }] }}>
        {isActive ? (
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            style={styles.dotActive}
          >
            <Ionicons name={step.icon as any} size={18} color="#fff" />
          </LinearGradient>
        ) : isPast ? (
          <View style={styles.dotDone}>
            <Ionicons name="checkmark" size={16} color="#22C55E" />
          </View>
        ) : (
          <View style={styles.dotPending}>
            <Ionicons name={step.icon as any} size={16} color={Colors.textSubtle} />
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <View style={styles.stepLabel}>
        <Text style={[styles.stepTitle, (isPast || isActive) && styles.stepTitleActive]}>
          {step.label}
        </Text>
        <Text style={styles.stepDesc}>{step.desc}</Text>
      </View>
    </View>
  );
}

export default function OrderTrackingScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [order,   setOrder]   = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch order ───────────────────────────────────────────────────────────
  const load = async () => {
    if (!user) return;
    const { data } = await fetchBuyerOrders(user.id);
    if (data) {
      const found = data.find(o => o.id === id);
      setOrder(found ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user?.id]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order_tracking_${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`,
      }, (payload) => {
        setOrder(prev => prev ? { ...prev, ...(payload.new as Partial<DbOrder>) } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // ── Seller: update status ─────────────────────────────────────────────────
  const handleAdvanceStatus = async () => {
    if (!order) return;
    const steps = STATUS_STEPS.map(s => s.key);
    const currentIdx = steps.indexOf(order.status);
    if (currentIdx < steps.length - 1) {
      const next = steps[currentIdx + 1];
      await updateOrderStatus(order.id, next);
      setOrder(prev => prev ? { ...prev, status: next } : prev);
    }
  };

  const isSeller = user?.id === order?.seller_id;

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FF4DA6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }]}>
        <StatusBar style="light" />
        <Ionicons name="receipt-outline" size={52} color={Colors.textSubtle} />
        <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
          Order not found
        </Text>
        <Pressable style={styles.backBtnCenter} onPress={() => router.back()}>
          <Text style={{ color: '#FF4DA6', fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentWeight = order.status === 'cancelled' ? -1 : (STATUS_WEIGHT[order.status] ?? 0);
  const isCancelled   = order.status === 'cancelled';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['rgba(14,14,14,1)', 'rgba(14,14,14,0.92)']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        {isCancelled ? (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledText}>Cancelled</Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={styles.statusBadgeText}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
          </LinearGradient>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Estimated Delivery Banner */}
        {!isCancelled ? (
          <LinearGradient
            colors={['rgba(255,77,166,0.12)', 'rgba(123,92,255,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deliveryBanner}
          >
            <Ionicons name="time-outline" size={20} color="#FF4DA6" />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliveryDate}>{estimatedDelivery(order.created_at)}</Text>
            </View>
            {order.status === 'delivered' ? (
              <View style={styles.deliveredTag}>
                <Text style={styles.deliveredTagText}>Delivered ✓</Text>
              </View>
            ) : null}
          </LinearGradient>
        ) : null}

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, i) => (
              <StepDot
                key={step.key}
                step={step}
                currentWeight={currentWeight}
                index={i}
              />
            ))}
          </View>
        </View>

        {/* Items */}
        {order.order_items && order.order_items.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.order_items.length})</Text>
            {order.order_items.map(item => (
              <View key={item.id} style={styles.orderItem}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="bag-outline" size={24} color={Colors.textSubtle} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>K{Number(item.price).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Delivery address */}
        {order.addresses ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressIconWrap}>
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.addressIcon}>
                  <Ionicons name="location-outline" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>{order.addresses.full_name}</Text>
                <Text style={styles.addressLine}>{order.addresses.address_line}</Text>
                <Text style={styles.addressLine}>{order.addresses.city}, {order.addresses.country}</Text>
                <Text style={styles.addressPhone}>{order.addresses.phone}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Payment summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>K{Number(order.total_price).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>Free</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: '800', color: Colors.textPrimary }]}>Total</Text>
              <LinearGradient
                colors={['#FF4DA6', '#7B5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.totalBadge}
              >
                <Text style={styles.totalText}>K{Number(order.total_price).toLocaleString()}</Text>
              </LinearGradient>
            </View>
            {order.payment_method ? (
              <View style={styles.paymentMethodRow}>
                <Ionicons name="card-outline" size={15} color={Colors.textSubtle} />
                <Text style={styles.paymentMethodText}>{order.payment_method}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Seller: Advance status button */}
      {isSeller && !isCancelled && order.status !== 'delivered' ? (
        <View style={[styles.sellerCTA, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable onPress={handleAdvanceStatus}>
            <LinearGradient
              colors={['#FF4DA6', '#7B5CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.advanceBtn}
            >
              <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
              <Text style={styles.advanceBtnText}>
                {order.status === 'pending' ? 'Confirm Order'
                  : order.status === 'confirmed' ? 'Mark as Shipped'
                  : 'Mark as Delivered'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  headerSub: { color: Colors.textSubtle, fontSize: 12, marginTop: 2 },

  statusBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  statusBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelledBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  cancelledText: { color: Colors.error, fontWeight: '700', fontSize: 13 },

  deliveryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.2)',
  },
  deliveryLabel: { color: Colors.textSubtle, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  deliveryDate: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  deliveredTag: {
    backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  deliveredTagText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },

  timelineSection: { paddingHorizontal: 24, paddingVertical: 8 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 16 },

  timeline: { paddingLeft: 4 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingBottom: 6 },
  connector: {
    position: 'absolute', left: 19, top: -20, width: 2, height: 26,
    backgroundColor: Colors.border,
  },
  connectorActive: { backgroundColor: '#22C55E' },

  dotActive: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4DA6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  dotDone: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 2, borderColor: '#22C55E',
  },
  dotPending: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  stepLabel: { flex: 1, paddingTop: 10, paddingBottom: 20 },
  stepTitle: { color: Colors.textSubtle, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  stepTitleActive: { color: Colors.textPrimary, fontWeight: '800' },
  stepDesc: { color: Colors.textSubtle, fontSize: 13, lineHeight: 18 },

  section: { paddingHorizontal: 20, paddingVertical: 12 },

  orderItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  itemImage: { width: 56, height: 56, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemQty: { color: Colors.textSubtle, fontSize: 12 },
  itemPrice: { color: '#FF4DA6', fontWeight: '800', fontSize: 15 },

  addressCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  addressIconWrap: {},
  addressIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addressName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  addressLine: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  addressPhone: { color: Colors.textSubtle, fontSize: 13, marginTop: 4 },

  summaryCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  totalBadge: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  totalText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  paymentMethodText: { color: Colors.textSubtle, fontSize: 13 },

  sellerCTA: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  advanceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 16, paddingVertical: 18, minHeight: 56,
  },
  advanceBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  backBtnCenter: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 24 },
});
