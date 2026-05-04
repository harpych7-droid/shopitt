import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

const CATEGORIES = ['All', 'Fashion', 'Sneakers', 'Luxury', 'Vintage', 'Electronics', 'Beauty', 'Services', 'Accessories'];

export default function CategoryTabs() {
  const [active, setActive] = useState('All');

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => setActive(cat)}>
            {active === cat ? (
              <LinearGradient
                colors={['#FF4DA6', '#7B5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chip}
              >
                <Text style={styles.chipTextActive}>{cat}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipText}>{cat}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(14,14,14,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    minHeight: 48,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
  },
  chipInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipTextActive: { color: '#fff', fontWeight: '700', fontSize: 13 },
  chipText: { color: Colors.textSecondary, fontWeight: '500', fontSize: 13 },
});
