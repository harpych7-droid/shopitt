import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, Animated, Dimensions, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

// Full global country list
const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo (DRC)', 'Congo (Republic)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe',
];

const COUNTRY_FLAGS: Record<string, string> = {
  'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼', 'South Africa': '🇿🇦', 'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪', 'Ghana': '🇬🇭', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬',
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'China': '🇨🇳', 'India': '🇮🇳',
  'Germany': '🇩🇪', 'France': '🇫🇷', 'Brazil': '🇧🇷', 'Australia': '🇦🇺',
  'Canada': '🇨🇦', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'United Arab Emirates': '🇦🇪',
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🌍';
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateCountry, profile } = useAuth();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(30)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(listOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.spring(listAnim, { toValue: 0, delay: 300, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    await updateCountry(selected);
    setSaving(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 20, opacity: logoAnim }]}>
        <LinearGradient
          colors={['#FF4DA6', '#7B5CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoPill}
        >
          <Text style={styles.logoText}>Shopitt</Text>
        </LinearGradient>
        <Text style={styles.heading}>Where are you based?</Text>
        <Text style={styles.subheading}>
          This helps us show you local drops first and set your currency correctly
        </Text>
      </Animated.View>

      {/* Search */}
      <Animated.View style={[styles.searchWrap, { opacity: listOpacity, transform: [{ translateY: listAnim }] }]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search country..."
            placeholderTextColor={Colors.textSubtle}
            value={search}
            onChangeText={setSearch}
            selectionColor="#FF4DA6"
            autoCapitalize="words"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x" size={16} color={Colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      {/* Selected preview */}
      {selected ? (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedFlag}>{getFlag(selected)}</Text>
          <Text style={styles.selectedName}>{selected}</Text>
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        </View>
      ) : null}

      {/* Country list */}
      <Animated.View style={[styles.listWrap, { opacity: listOpacity, transform: [{ translateY: listAnim }] }]}>
        <FlatList
          data={filtered}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const isSelected = selected === item;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.countryRow,
                  isSelected && styles.countryRowSelected,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.countryFlag}>{getFlag(item)}</Text>
                <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                  {item}
                </Text>
                {isSelected ? (
                  <LinearGradient
                    colors={['#FF4DA6', '#7B5CFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.checkCircle}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </Pressable>
            );
          }}
        />
      </Animated.View>

      {/* CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleContinue} disabled={!selected || saving}>
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.continueBtn, (!selected || saving) && { opacity: 0.4 }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueBtnText}>
                {selected ? `Continue as ${selected} 🎉` : 'Select your country'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  logoPill: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, marginBottom: 20,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heading: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subheading: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  searchWrap: { paddingHorizontal: 20, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 15 },

  selectedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)',
  },
  selectedFlag: { fontSize: 22 },
  selectedName: { flex: 1, color: '#22C55E', fontWeight: '700', fontSize: 15 },

  listWrap: { flex: 1, marginHorizontal: 20 },

  countryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 4,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  countryRowSelected: {
    borderColor: '#FF4DA6',
    backgroundColor: 'rgba(255,77,166,0.06)',
  },
  countryFlag: { fontSize: 22, width: 28, textAlign: 'center' },
  countryName: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  countryNameSelected: { color: '#FF4DA6', fontWeight: '700' },

  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },

  ctaWrap: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  continueBtn: {
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center', minHeight: 56,
  },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
