import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

const SECTIONS = [
  { title: 'Information We Collect', body: 'We collect information you provide directly to us such as name, email, phone number, location, and payment details. We also collect device information and usage data to improve your experience.' },
  { title: 'How We Use Your Information', body: 'Your information is used to operate the Shopitt platform, process transactions, send notifications, prevent fraud, and provide customer support.' },
  { title: 'Information Sharing', body: 'We do not sell your personal data. We may share information with sellers when you make a purchase, and with service providers who help operate our platform.' },
  { title: 'Data Security', body: 'We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.' },
  { title: 'Cookies & Tracking', body: 'Shopitt uses cookies and similar technologies to personalize your experience, analyze usage, and deliver targeted content.' },
  { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data. Contact our support team to exercise these rights.' },
  { title: 'Contact Us', body: 'For privacy-related inquiries, email us at shopitt54@gmail.com or call 0573105096. AETHØNN Inc., Lusaka, Zambia.' },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={styles.lastUpdated}>Last updated: April 2026 · AETHØNN Inc.</Text>
        <Text style={styles.intro}>
          At AETHØNN Inc., we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use Shopitt.
        </Text>

        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AETHØNN Inc. All rights reserved.</Text>
          <Text style={styles.footerText}>shopitt54@gmail.com · 0573105096</Text>
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
  lastUpdated:  { color: Colors.textSubtle, fontSize: 12, marginBottom: 8 },
  intro: {
    color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24,
    padding: 16, backgroundColor: Colors.surfaceCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  section:      { marginBottom: 20 },
  sectionTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  sectionBody:  { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  footer: {
    marginTop: 12, padding: 14, backgroundColor: Colors.surfaceCard,
    borderRadius: 12, gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  footerText: { color: Colors.textSubtle, fontSize: 12, textAlign: 'center' },
});
