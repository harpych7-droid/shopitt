import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

const TIPS = [
  { icon: '💳', title: 'Never pay outside the app', desc: 'Always use Shopitt\'s secure checkout. Do not transfer money via untrusted means.' },
  { icon: '🔐', title: 'Protect your account', desc: 'Use a strong password and never share your login credentials with anyone.' },
  { icon: '📦', title: 'Verify before paying', desc: 'Check product photos, seller reviews, and sold count before making a purchase.' },
  { icon: '🚩', title: 'Report suspicious sellers', desc: 'Use the 3-dot menu on any post to report suspicious activity or fake listings.' },
  { icon: '🤝', title: 'Meet in safe locations', desc: 'For local pickups, arrange meetups in public, well-lit places.' },
  { icon: '📞', title: 'Contact support', desc: 'If you feel unsafe or have been scammed, contact our support team immediately.' },
];

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Safety Tips</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🛡️</Text>
          <Text style={styles.bannerTitle}>Stay Safe on Shopitt</Text>
          <Text style={styles.bannerSub}>Your security is our top priority. Follow these tips to shop safely.</Text>
        </View>

        {TIPS.map((tip, idx) => (
          <View key={idx} style={styles.tipCard}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.emergencyCard}>
          <Ionicons name="warning-outline" size={24} color="#F59E0B" />
          <Text style={styles.emergencyTitle}>Emergency?</Text>
          <Text style={styles.emergencySub}>If you believe you have been scammed, report immediately.</Text>
          <Pressable onPress={() => router.push('/info/contact')} style={styles.reportBtn}>
            <Text style={styles.reportBtnText}>Report Now →</Text>
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
  banner: { backgroundColor: 'rgba(123,92,255,0.1)', borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(123,92,255,0.2)' },
  bannerIcon: { fontSize: 48 },
  bannerTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  bannerSub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: Colors.border },
  tipIcon: { fontSize: 28 },
  tipContent: { flex: 1 },
  tipTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 6 },
  tipDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  emergencyCard: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, marginTop: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  emergencyTitle: { color: '#F59E0B', fontSize: 18, fontWeight: '800' },
  emergencySub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  reportBtn: { marginTop: 4 },
  reportBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 15 },
});
