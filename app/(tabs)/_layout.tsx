import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBag } from '@/hooks/useBag';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount, subscribeToNotifications } from '@/services/notificationsService';

function CreateTabIcon() {
  return (
    <LinearGradient
      colors={['#FF4DA6', '#7B5CFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.createBtn}
    >
      <Feather name="plus" size={22} color="#fff" />
    </LinearGradient>
  );
}

function AlertsIcon({ color }: { color: string }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    // Fetch initial count
    getUnreadCount(user.id).then(count => setUnreadCount(count));

    // Subscribe to real-time new notifications
    const sub = subscribeToNotifications(user.id, () => {
      setUnreadCount(prev => prev + 1);
    });

    return () => { sub.unsubscribe(); };
  }, [user?.id]);

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="notifications-outline" size={24} color={color} />
      {unreadCount > 0 ? (
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { totalCount, syncWithUser } = useBag();
  const { user } = useAuth();

  // Sync cart when user logs in
  useEffect(() => {
    if (user) {
      syncWithUser(user.id);
    }
  }, [user?.id]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 60, android: 70, default: 70 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: insets.bottom + 8, android: 10, default: 8 }),
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: '#1E1E1E',
        },
        tabBarActiveTintColor: '#FF4DA6',
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shorts"
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="play-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => <CreateTabIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <AlertsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    shadowColor: '#FF4DA6', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  alertBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: '#FF3B30', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  alertBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
