import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

const SECTIONS = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using Shopitt, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our service.' },
  { title: '2. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.' },
  { title: '3. Marketplace Rules', body: 'Shopitt is a platform that connects buyers and sellers. We do not own, create, sell, resell, provide, control, manage, offer, deliver, or supply any listings. Sellers are independent third parties.' },
  { title: '4. Prohibited Items', body: 'Users may not list counterfeit goods, stolen items, illegal substances, weapons, or any items that violate Zambian law or international regulations.' },
  { title: '5. Payments & Fees', body: 'Shopitt may charge transaction fees for completed sales. Payment processing is handled through approved payment providers. Sellers are responsible for accurate pricing.' },
  { title: '6. Dispute Resolution', body: 'In case of disputes between buyers and sellers, Shopitt will mediate where possible. Final decisions rest with AETHØNN Inc. management.' },
  { title: '7. Limitation of Liability', body: 'AETHØNN Inc. shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.' },
  { title: '8. Governing Law', body: 'These Terms shall be governed by and construed in accordance with the laws of the Republic of Zambia.' },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={styles.lastUpdated}>Last updated: April 2026 · AETHØNN Inc.</Text>

        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AETHØNN Inc. All rights reserved.</Text>
          <Text style={styles.footerText}>Shopitt is a product of AETHØNN Inc., Lusaka, Zambia.</Text>
          <Text style={styles.footerText}>Contact: shopitt54@gmail.com · 0573105096</Text>
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
  headerTitle:  { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  lastUpdated:  { color: Colors.textSubtle, fontSize: 12, marginBottom: 24, lineHeight: 18 },
  section:      { marginBottom: 20 },
  sectionTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  sectionBody:  { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  footer: {
    marginTop: 20, padding: 16, backgroundColor: Colors.surfaceCard,
    borderRadius: 12, gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  footerText: { color: Colors.textSubtle, fontSize: 12, textAlign: 'center' },
});
