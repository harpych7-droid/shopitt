import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Platform-aware storage so sessions survive app restarts on both native and web
const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) =>
        Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: false, // We handle deep-link codes manually
    flowType: 'pkce',          // Required for mobile OAuth security
  },
});
