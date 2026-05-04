import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useBag } from '@/hooks/useBag';

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalCount } = useBag();

  const subtotal = items.reduce((sum, item) => {
    const numPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + numPrice * item.quantity;
  }, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Bag ({totalCount})</Text>
        <View style={{ width: 22 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySub}>Tap Buy Now on any product to add it here</Text>
          <Pressable onPress={() => router.back()}>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          >
            {items.map(item => (
              <View key={item.id} style={styles.bagItem}>
                <Image source={{ uri: item.image }} style={styles.bagImg} contentFit="cover" />
                <View style={styles.bagInfo}>
                  <Text style={styles.bagName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.bagPrice}>{item.price}</Text>
                  <View style={styles.qtyRow}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Feather name="minus" size={16} color={Colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Feather name="plus" size={16} color={Colors.textPrimary} />
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                  <Feather name="x" size={20} color={Colors.textSubtle} />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Checkout Footer */}
          <View style={[styles.checkoutFooter, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>K{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Delivery</Text>
              <Text style={[styles.subtotalValue, { color: '#22C55E' }]}>Free</Text>
            </View>
            <View style={[styles.subtotalRow, { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border }]}>
              <Text style={[styles.subtotalLabel, { color: Colors.textPrimary, fontWeight: '700', fontSize: 16 }]}>Total</Text>
              <Text style={[styles.subtotalValue, { fontSize: 20 }]}>K{subtotal.toLocaleString()}</Text>
            </View>
            <Pressable onPress={() => router.push('/checkout')}>
              <LinearGradient
                colors={['#FF4DA6', '#7B5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkoutBtn}
              >
                <Ionicons name="bag-check-outline" size={20} color="#fff" />
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  emptySub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  shopBtn: { borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  bagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  bagImg: { width: 80, height: 80, borderRadius: 12 },
  bagInfo: { flex: 1 },
  bagName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  bagPrice: { color: '#FF4DA6', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  checkoutFooter: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  subtotalLabel: { color: Colors.textSecondary, fontSize: 14 },
  subtotalValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
