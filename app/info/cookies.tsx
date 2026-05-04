import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

export default function CookiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [essential] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Cookie Policy</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={styles.intro}>We use cookies and similar technologies to enhance your experience on Shopitt. You can manage your preferences below.</Text>

        {/* Cookie toggles */}
        <Text style={styles.sectionTitle}>MANAGE COOKIES</Text>

        <View style={styles.cookieCard}>
          <View style={styles.cookieInfo}>
            <Text style={styles.cookieName}>Essential Cookies</Text>
            <Text style={styles.cookieDesc}>Required for the app to function. Cannot be disabled.</Text>
          </View>
          <Switch value={essential} disabled trackColor={{ true: '#22C55E', false: Colors.border }} />
        </View>

        <View style={styles.cookieCard}>
          <View style={styles.cookieInfo}>
            <Text style={styles.cookieName}>Analytics Cookies</Text>
            <Text style={styles.cookieDesc}>Help us understand how you use Shopitt to improve the experience.</Text>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ true: '#7B5CFF', false: Colors.border }}
            thumbColor={analytics ? '#fff' : Colors.textSubtle}
          />
        </View>

        <View style={styles.cookieCard}>
          <View style={styles.cookieInfo}>
            <Text style={styles.cookieName}>Marketing Cookies</Text>
            <Text style={styles.cookieDesc}>Allow us to show you personalized product recommendations and ads.</Text>
          </View>
          <Switch
            value={marketing}
            onValueChange={setMarketing}
            trackColor={{ true: '#FF4DA6', false: Colors.border }}
            thumbColor={marketing ? '#fff' : Colors.textSubtle}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>WHAT ARE COOKIES?</Text>
        <Text style={styles.body}>Cookies are small text files stored on your device when you use Shopitt. They help us remember your preferences, keep you logged in, and understand how you interact with our platform.</Text>

        <Pressable>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  intro: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24, padding: 16, backgroundColor: Colors.surfaceCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
  cookieCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: Colors.border },
  cookieInfo: { flex: 1 },
  cookieName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  cookieDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  body: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
