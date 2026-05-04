import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

const FAQ = [
  { q: 'How do I track my order?', a: 'Go to your Profile → Orders to see real-time status of all your orders with a step-by-step timeline.' },
  { q: 'How do I become a seller?', a: 'Any user can post products or services from the Create (+) tab. Your seller dashboard activates after your first post.' },
  { q: 'What payment methods are accepted?', a: 'Shopitt supports Mobile Money (Airtel/Zamtel/MTN) and Cash on Delivery.' },
  { q: 'How long does delivery take?', a: 'Sellers who show "Ships 24h" dispatch within 24 hours. Standard delivery takes 1–5 business days depending on your location.' },
  { q: 'Can I return an item?', a: 'Returns are handled between buyer and seller. Contact the seller directly via chat for return requests.' },
  { q: 'How does the Bag work?', a: 'Tap "Buy Now" on any product to add it to your Bag. Open the Bag icon at the bottom-left to review and checkout.' },
  { q: 'How do I use a Magic Link?', a: 'Enter your email on the login screen and tap "Send Magic Link". Check your inbox and tap the link to sign in instantly — no password needed.' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        {/* Hero */}
        <LinearGradient colors={['rgba(255,77,166,0.15)', 'rgba(123,92,255,0.15)']} style={styles.hero}>
          <Ionicons name="help-circle" size={48} color="#FF4DA6" />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Find answers to common questions below</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQ.map((item, idx) => (
          <View key={idx} style={styles.faqCard}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>AETHØNN Inc. support team is available 24/7</Text>
          <Text style={styles.contactDetail}>shopitt54@gmail.com · 0573105096</Text>
          <Pressable onPress={() => router.push('/info/contact')}>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>Contact Support</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  hero: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24, gap: 8 },
  heroTitle:    { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  heroSub:      { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  sectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
  faqCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  faqQ: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  faqA: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  contactCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: 16, padding: 20,
    marginTop: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border,
  },
  contactTitle:  { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  contactSub:    { color: Colors.textSecondary, fontSize: 13 },
  contactDetail: { color: Colors.textSubtle, fontSize: 12, marginBottom: 8 },
  contactBtn:    { borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12 },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
