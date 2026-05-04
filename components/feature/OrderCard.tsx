import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Order } from '@/services/mockData';

interface OrderCardProps {
  order: Order;
  onConfirm: (id: string) => void;
  onDeliver: (id: string) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: 'checkmark-circle-outline' },
  delivered: { label: 'Delivered', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', icon: 'bag-check-outline' },
};

export default function OrderCard({ order, onConfirm, onDeliver }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status];

  return (
    <View style={styles.card}>
      {order.isNew ? (
        <View style={styles.newOrderBadge}>
          <Text style={styles.newOrderText}>🔥 NEW ORDER</Text>
        </View>
      ) : null}

      {/* Header row */}
      <View style={styles.headerRow}>
        <Image source={{ uri: order.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.headerInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{order.username}</Text>
            {order.verified ? <MaterialIcons name="verified" size={14} color="#3B82F6" /> : null}
          </View>
          <Text style={styles.orderId}>{order.orderId}</Text>
        </View>
        <View style={styles.statusGroup}>
          <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={13} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.timeAgo}>{order.timeAgo}</Text>
        </View>
      </View>

      {/* Product */}
      <View style={styles.productRow}>
        <MaterialIcons name="inventory-2" size={18} color={Colors.textSubtle} />
        <Text style={styles.productName}>{order.productName}</Text>
        <Text style={styles.quantity}>×{order.quantity}</Text>
      </View>

      {/* Total + Location */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalAmount}>{order.total}</Text>
        </View>
        <Text style={styles.location}>📍 {order.location}</Text>
      </View>

      {/* Action Button */}
      {order.status === 'pending' ? (
        <Pressable onPress={() => onConfirm(order.id)}>
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtn}
          >
            <MaterialIcons name="check-circle-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Confirm Order</Text>
          </LinearGradient>
        </Pressable>
      ) : order.status === 'confirmed' ? (
        <Pressable style={[styles.actionBtn, styles.deliverBtn]} onPress={() => onDeliver(order.id)}>
          <Ionicons name="bicycle-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Mark as Delivered</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  newOrderBadge: {
    backgroundColor: 'rgba(255,77,77,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.25)',
  },
  newOrderText: { color: '#FF4DA6', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  headerInfo: { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  username: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  orderId: { color: Colors.textSubtle, fontSize: 12, marginTop: 2 },
  statusGroup: { alignItems: 'flex-end', gap: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  timeAgo: { color: Colors.textSubtle, fontSize: 11 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  productName: { flex: 1, color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  quantity: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  totalLabel: { color: Colors.textSubtle, fontSize: 12, marginBottom: 2 },
  totalAmount: { color: '#FF4DA6', fontWeight: '800', fontSize: 26 },
  location: { color: Colors.textSecondary, fontSize: 13 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  deliverBtn: { backgroundColor: '#16A34A' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
