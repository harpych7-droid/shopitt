import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import FloatingBag from '@/components/ui/FloatingBag';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/services/postsService';
import { uploadMultipleImages, uploadMedia } from '@/services/cloudinaryService';

type PostType = 'product' | 'short' | 'service' | null;
type DeliveryType = 'Local' | 'Country' | 'International';
type CourierType = 'Self Delivery' | 'Platform Courier';

const CATEGORIES = ['Streetwear', 'Sneakers', 'Luxury', 'Vintage', 'Beauty', 'Electronics', 'Accessories'];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [postType, setPostType] = useState<PostType>(null);

  // Form fields
  const [dropTitle, setDropTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [delivery, setDelivery] = useState<DeliveryType>('Country');
  const [courier, setCourier] = useState<CourierType>('Self Delivery');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const showErr = (msg: string) => {
    setErrorMsg(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const pickMedia = async () => {
    if (mediaUris.length >= 5) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showErr('Media library permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 5 - mediaUris.length,
      quality: 0.85,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setMediaUris(prev => [...prev, ...newUris].slice(0, 5));
    }
  };

  const handlePost = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!dropTitle.trim()) { showErr('Drop Title is required'); return; }
    if (postType !== 'service' && !price.trim()) { showErr('Price is required'); return; }
    if (postType === 'short' && mediaUris.length === 0) { showErr('At least 1 video is required'); return; }

    setIsUploading(true);
    try {
      let mediaUrls: string[] = [];

      if (mediaUris.length > 0) {
        const isVideo = postType === 'short';
        if (isVideo) {
          const result = await uploadMedia(mediaUris[0], 'video');
          if (result.data) mediaUrls = [result.data.url];
        } else {
          mediaUrls = await uploadMultipleImages(mediaUris);
        }
      }

      const tagList = hashtags.split(/\s+/).filter(t => t.startsWith('#'));

      const { error } = await createPost({
        user_id: user.id,
        drop_title: dropTitle.trim(),
        caption: description.trim() || null,
        media_urls: mediaUrls,
        price: postType !== 'service' ? parseFloat(price) || null : null,
        quantity: postType === 'product' ? parseInt(quantity) || null : null,
        type: postType === 'short' ? 'short' : postType === 'service' ? 'service' : 'product',
        delivery_type: delivery.toLowerCase() as any,
        courier_type: courier === 'Self Delivery' ? 'self' : 'platform',
        category: selectedCategory || null,
        hashtags: tagList,
      });

      if (error) { showErr(error); return; }

      // Reset
      setPostType(null);
      setDropTitle('');
      setDescription('');
      setHashtags('');
      setPrice('');
      setQuantity('');
      setSelectedCategory('');
      setMediaUris([]);
      router.back();
    } finally {
      setIsUploading(false);
    }
  };

  // ─── POST TYPE SELECTOR ───
  if (!postType) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.dragPill} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {!user ? (
            <View style={styles.authPrompt}>
              <Text style={styles.authPromptEmoji}>🔐</Text>
              <Text style={styles.authPromptTitle}>Sign in to create</Text>
              <Text style={styles.authPromptSub}>You need an account to post products or services</Text>
              <Pressable onPress={() => router.push('/login')}>
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authPromptBtn}>
                  <Text style={styles.authPromptBtnText}>Sign In / Create Account</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.whatTitle}>What are you creating?</Text>
              <Text style={styles.whatSub}>Choose your post type to get started</Text>

              <Pressable style={({ pressed }) => [styles.typeCard, pressed && { opacity: 0.85 }]} onPress={() => setPostType('product')}>
                <LinearGradient colors={['#5B3CFF', '#7B5CFF']} style={styles.typeIconBg}>
                  <MaterialIcons name="view-in-ar" size={26} color="#fff" />
                </LinearGradient>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Post Product</Text>
                  <Text style={styles.typeSub}>Sell fashion, sneakers, accessories...</Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.textSubtle} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.typeCard, pressed && { opacity: 0.85 }]} onPress={() => setPostType('short')}>
                <LinearGradient colors={['#FF4DA6', '#FF6B6B']} style={styles.typeIconBg}>
                  <MaterialIcons name="videocam" size={26} color="#fff" />
                </LinearGradient>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Post Short Video</Text>
                  <Text style={styles.typeSub}>Vertical 9:16 — appears in Shorts feed</Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.textSubtle} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.typeCard, pressed && { opacity: 0.85 }]} onPress={() => setPostType('service')}>
                <LinearGradient colors={['#00B4D8', '#0077B6']} style={styles.typeIconBg}>
                  <MaterialIcons name="work-outline" size={26} color="#fff" />
                </LinearGradient>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Post Service</Text>
                  <Text style={styles.typeSub}>Tailoring, beauty, styling & more</Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.textSubtle} />
              </Pressable>
            </>
          )}
        </ScrollView>

        <FloatingBag />
      </View>
    );
  }

  const isService = postType === 'service';
  const isShort = postType === 'short';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => setPostType(null)}>
          <Feather name="x" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        <Pressable style={styles.postBtn} onPress={handlePost} disabled={isUploading}>
          <Text style={styles.postBtnText}>{isUploading ? '...' : 'Post'}</Text>
        </Pressable>
      </View>

      <LinearGradient colors={['rgba(255,77,166,0.08)', 'rgba(123,92,255,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.typeIndicator}>
        {isService ? <MaterialIcons name="work-outline" size={14} color="#7B5CFF" /> : isShort ? <MaterialIcons name="videocam" size={14} color="#FF4DA6" /> : <MaterialIcons name="view-in-ar" size={14} color="#7B5CFF" />}
        <Text style={styles.typeIndicatorText}>
          {isService ? 'Service Post' : isShort ? 'Short Video' : 'Product Post'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* MEDIA */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -16 }} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 10 }}>
          <Pressable style={styles.mediaUpload} onPress={pickMedia}>
            <LinearGradient colors={['rgba(255,77,166,0.15)', 'rgba(123,92,255,0.15)']} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="camera-outline" size={32} color={Colors.gradientStart} />
            <Text style={styles.mediaUploadText}>Add Photo/Video</Text>
            <Text style={styles.mediaCount}>{mediaUris.length}/5</Text>
          </Pressable>
          {mediaUris.map((uri, idx) => (
            <View key={idx} style={styles.mediaThumb}>
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <Pressable style={styles.mediaRemove} onPress={() => setMediaUris(prev => prev.filter((_, i) => i !== idx))}>
                <Feather name="x" size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {/* DROP TITLE */}
        <View style={styles.labelRow}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.labelPill}>
            <Text style={styles.labelPillText}>Drop Title *</Text>
          </LinearGradient>
        </View>
        <TextInput
          style={styles.input}
          placeholder={isService ? 'e.g. New Drop Just Landed 🔥' : 'e.g. Air Jordan 1 Retro High'}
          placeholderTextColor={Colors.textSubtle}
          value={dropTitle}
          onChangeText={setDropTitle}
          selectionColor="#FF4DA6"
        />
        <Text style={styles.inputHint}>This appears as the hook text on your post — make it count</Text>

        {/* DESCRIPTION */}
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell buyers what makes this special..."
          placeholderTextColor={Colors.textSubtle}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          selectionColor="#FF4DA6"
        />

        {/* HASHTAGS */}
        <Text style={styles.fieldLabel}>Hashtags</Text>
        <TextInput
          style={styles.input}
          placeholder="#fashion #streetwear #shopzambia"
          placeholderTextColor={Colors.textSubtle}
          value={hashtags}
          onChangeText={setHashtags}
          selectionColor="#FF4DA6"
        />

        {/* PRICE + QUANTITY */}
        {!isShort ? (
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Price (K) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textSubtle}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                selectionColor="#FF4DA6"
              />
            </View>
            {!isService ? (
              <>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textSubtle}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    selectionColor="#FF4DA6"
                  />
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {/* CATEGORY */}
        {!isShort ? (
          <>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable key={cat} onPress={() => setSelectedCategory(cat)}>
                    {isSelected ? (
                      <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.catChipActive}>
                        <Text style={styles.catChipTextActive}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.catChip}>
                        <Text style={styles.catChipText}>{cat}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* DELIVERY REACH */}
            <Text style={styles.fieldLabel}>Delivery Reach *</Text>
            <View style={styles.deliveryRow}>
              {(['Local', 'Country', 'International'] as DeliveryType[]).map(d => (
                <Pressable key={d} style={{ flex: 1 }} onPress={() => setDelivery(d)}>
                  {delivery === d ? (
                    <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.deliveryActive}>
                      <Text style={styles.deliveryActiveText}>{d}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.deliveryInactive}>
                      <Text style={styles.deliveryInactiveText}>{d}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {delivery ? (
              <View style={styles.deliveryHint}>
                <Ionicons name={delivery === 'Local' ? 'location-outline' : delivery === 'Country' ? 'flag-outline' : 'globe-outline'} size={14} color="#7B5CFF" />
                <Text style={styles.deliveryHintText}>
                  {delivery === 'Local' ? 'Visible to users in your city' : delivery === 'Country' ? 'Visible to users within your country' : 'Visible to international buyers worldwide'}
                </Text>
              </View>
            ) : null}

            {/* COURIER TYPE */}
            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Courier Type</Text>
            <View style={styles.courierRow}>
              {(['Self Delivery', 'Platform Courier'] as CourierType[]).map(c => {
                const isSelected = courier === c;
                return (
                  <Pressable key={c} style={[styles.courierOption, isSelected && styles.courierOptionActive]} onPress={() => setCourier(c)}>
                    <Ionicons name={c === 'Self Delivery' ? 'bicycle-outline' : 'car-outline'} size={20} color={isSelected ? '#FF4DA6' : Colors.textSecondary} />
                    <Text style={[styles.courierOptionText, isSelected && { color: '#FF4DA6' }]}>{c}</Text>
                    {isSelected ? <View style={styles.courierCheck}><Ionicons name="checkmark" size={10} color="#fff" /></View> : null}
                  </Pressable>
                );
              })}
            </View>

            {courier === 'Platform Courier' ? (
              <View style={styles.courierNote}>
                <Ionicons name="information-circle-outline" size={15} color="#F59E0B" />
                <Text style={styles.courierNoteText}>Handled by courier (seller fee applies){'\n'}{'// INSERT COURIER API HERE'}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        {showError ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color="#F59E0B" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* STICKY POST BUTTON */}
      <View style={[styles.stickyPost, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={handlePost} disabled={isUploading}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.stickyPostBtn, isUploading && { opacity: 0.7 }]}>
            <Ionicons name={isUploading ? 'sync-outline' : 'cloud-upload-outline'} size={20} color="#fff" />
            <Text style={styles.stickyPostText}>{isUploading ? 'Uploading...' : 'Publish Post'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <FloatingBag />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  postBtn: { backgroundColor: Colors.surfaceElevated, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  postBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  typeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  typeIndicatorText: { color: '#7B5CFF', fontSize: 12, fontWeight: '700' },
  dragPill: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  whatTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  whatSub: { color: Colors.textSecondary, fontSize: 15, marginBottom: 32 },
  typeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: 16, padding: 16, marginBottom: 12, gap: 14, borderWidth: 1, borderColor: Colors.border },
  typeIconBg: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  typeName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16 },
  typeSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  formScroll: { flex: 1 },
  mediaUpload: { width: 130, height: 130, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,77,166,0.4)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  mediaUploadText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 13 },
  mediaCount: { color: Colors.textSubtle, fontSize: 12 },
  mediaThumb: { width: 130, height: 130, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  mediaRemove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  labelRow: { marginBottom: 10, marginTop: 4 },
  labelPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  labelPillText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  input: { backgroundColor: Colors.surfaceCard, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 15, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 110, textAlignVertical: 'top', paddingTop: 14 },
  inputHint: { color: Colors.textSubtle, fontSize: 12, marginBottom: 20 },
  fieldLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  rowFields: { flexDirection: 'row', marginBottom: 0 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  catChipText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  catChipTextActive: { color: '#fff', fontWeight: '700', fontSize: 14 },
  deliveryRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  deliveryActive: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  deliveryActiveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  deliveryInactive: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  deliveryInactiveText: { color: Colors.textSecondary, fontWeight: '500', fontSize: 14 },
  deliveryHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(123,92,255,0.1)', borderRadius: 10, padding: 12, marginTop: 10, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(123,92,255,0.2)' },
  deliveryHintText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  courierRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  courierOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surfaceCard, borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: Colors.border, position: 'relative' },
  courierOptionActive: { borderColor: '#FF4DA6', backgroundColor: 'rgba(255,77,166,0.06)' },
  courierOptionText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13, flex: 1 },
  courierCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FF4DA6', alignItems: 'center', justifyContent: 'center' },
  courierNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  courierNoteText: { color: '#F59E0B', fontSize: 12, fontWeight: '600', flex: 1 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: 14, marginTop: 8 },
  errorText: { color: '#F59E0B', fontSize: 14, fontWeight: '600', flex: 1 },
  stickyPost: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surfaceCard, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  stickyPostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16 },
  stickyPostText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Auth prompt
  authPrompt: { alignItems: 'center', paddingVertical: 40 },
  authPromptEmoji: { fontSize: 56, marginBottom: 16 },
  authPromptTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  authPromptSub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 28 },
  authPromptBtn: { borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 },
  authPromptBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
