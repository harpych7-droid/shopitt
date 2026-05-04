import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        {sent ? (
          <View style={styles.successState}>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>Message Sent!</Text>
            <Text style={styles.successSub}>Our team will get back to you within 24 hours.</Text>
            <Pressable onPress={() => router.back()}>
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backHomeBtn}>
                <Text style={styles.backHomeBtnText}>Back to Menu</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Contact methods */}
            <View style={styles.contactMethods}>
              <View style={styles.contactMethod}>
                <View style={styles.methodIcon}><MaterialIcons name="email" size={20} color="#FF4DA6" /></View>
                <View>
                  <Text style={styles.methodLabel}>Email</Text>
                  <Text style={styles.methodValue}>shopitt54@gmail.com</Text>
                </View>
              </View>
              <View style={styles.contactMethod}>
                <View style={styles.methodIcon}><Ionicons name="logo-whatsapp" size={20} color="#22C55E" /></View>
                <View>
                  <Text style={styles.methodLabel}>WhatsApp</Text>
                  <Text style={styles.methodValue}>0573105096</Text>
                </View>
              </View>
              <View style={styles.contactMethod}>
                <View style={styles.methodIcon}><Feather name="clock" size={20} color="#7B5CFF" /></View>
                <View>
                  <Text style={styles.methodLabel}>Response Time</Text>
                  <Text style={styles.methodValue}>Within 24 hours</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>SEND US A MESSAGE</Text>

            <Text style={styles.fieldLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="What is this about?"
              placeholderTextColor={Colors.textSubtle}
              value={subject}
              onChangeText={setSubject}
              selectionColor="#FF4DA6"
            />

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue or question in detail..."
              placeholderTextColor={Colors.textSubtle}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              selectionColor="#FF4DA6"
            />

            <Pressable onPress={handleSend}>
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendBtn}>
                <Feather name="send" size={18} color="#fff" />
                <Text style={styles.sendBtnText}>Send Message</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.companyCard}>
              <Text style={styles.companyName}>AETHØNN Inc.</Text>
              <Text style={styles.companyDetail}>shopitt54@gmail.com</Text>
              <Text style={styles.companyDetail}>0573105096</Text>
              <Text style={styles.companyDetail}>Lusaka, Zambia</Text>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  contactMethods: {
    backgroundColor: Colors.surfaceCard, borderRadius: 16, padding: 16,
    gap: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.border,
  },
  contactMethod: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  methodIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { color: Colors.textSubtle, fontSize: 12, marginBottom: 2 },
  methodValue: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  sectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
  fieldLabel:   { color: Colors.textPrimary, fontWeight: '600', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surfaceCard, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  textArea:    { height: 130, textAlignVertical: 'top', paddingTop: 13 },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, paddingVertical: 16,
  },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  successState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 16 },
  successIcon:  { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  successSub:   { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  backHomeBtn:  { borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  backHomeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  companyCard: {
    marginTop: 24, padding: 16, backgroundColor: Colors.surfaceCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 4,
  },
  companyName:   { color: Colors.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  companyDetail: { color: Colors.textSubtle, fontSize: 13 },
});
