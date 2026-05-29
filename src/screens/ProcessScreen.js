import React, { useState, useRef } from 'react';
import {
  View, Image, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, Text, TouchableOpacity, Modal, Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { vehicleService } from '../services/vehicleService';
import { readTextFromImage, parseOcrResult } from '../services/ocrService';
import { Input } from '../components/ui/Input';
import { PlateInput } from '../components/ui/PlateInput';
import { Button } from '../components/ui/Button';
import { BrandPicker } from '../components/BrandPicker';
import { Check, X, ZoomIn, ScanLine } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FLOORS = ['1', '2', '3', '4', 'مأوى عام'];
const PLATE_TYPES = ['تونسية', 'إدارية', 'أجنبية'];

function parsePlate(fullPlate = '') {
  if (!fullPlate) return { type: 'تونسية', right: '', left: '', raw: '' };
  
  if (fullPlate.includes('تونس')) {
    const parts = fullPlate.split(' تونس ');
    return { type: 'تونسية', right: parts[0]?.trim() || '', left: parts[1]?.trim() || '', raw: fullPlate };
  }
  
  // Check if purely digits (allow some spaces)
  const isOnlyDigits = /^\d+$/.test(fullPlate.replace(/[\s-]/g, ''));
  if (isOnlyDigits) {
    return { type: 'إدارية', right: '', left: '', raw: fullPlate };
  }
  
  return { type: 'أجنبية', right: '', left: '', raw: fullPlate };
}

export const ProcessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, photoUri, existingPlate = '', existingMake = '', existingFloor = '' } = route.params;

  const parsed = parsePlate(existingPlate);
  const [plateType, setPlateType] = useState(parsed.type);
  const [plateLeft, setPlateLeft] = useState(parsed.left);
  const [plateRight, setPlateRight] = useState(parsed.right);
  const [rawPlate, setRawPlate] = useState(parsed.raw);
  const [make, setMake] = useState(existingMake);
  const [floor, setFloor] = useState(existingFloor);
  const [errors, setErrors] = useState({});
  const [zoomVisible, setZoomVisible] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const leftInputRef = useRef(null);

  // ─── OCR ────────────────────────────────────────────────────────────
  const handleOCR = async () => {
    try {
      setOcrLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const rawText = await readTextFromImage(photoUri);
      
      if (!rawText) {
        Alert.alert('تنبيه', 'لم يتم التعرف على اللوحة. يرجى المحاولة مرة أخرى أو الإدخال اليدوي.');
        return;
      }

      // Automatically guess the type and extract data
      const result = parseOcrResult(rawText, plateType);

      setPlateType(result.type);
      
      if (result.type === 'تونسية') {
        setPlateLeft(result.left);
        setPlateRight(result.right);
      } else {
        setRawPlate(result.raw);
      }
      
      if (result.brand) {
        setMake(result.brand);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('خطأ في المسح', 'تحقق من الاتصال بالإنترنت.\n' + error.message);
    } finally {
      setOcrLoading(false);
    }
  };

  // ─── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    let fullPlate = '';
    
    if (plateType === 'تونسية') {
      if (!plateLeft.trim() && !plateRight.trim()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({ plate: 'الرجاء إدخال رقم اللوحة' });
        return;
      }
      fullPlate = `${plateRight.trim()} تونس ${plateLeft.trim()}`;
    } else {
      if (!rawPlate.trim()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({ plate: 'الرجاء إدخال رقم اللوحة' });
        return;
      }
      fullPlate = rawPlate.trim();
    }

    setErrors({});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await vehicleService.saveDraft(vehicleId, fullPlate, make, floor);
    navigation.goBack();
  };

  const handleDiscard = async () => {
    Alert.alert('حذف', 'هل أنت متأكد من حذف هذه الصورة؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم', style: 'destructive',
        onPress: async () => {
          await vehicleService.deleteVehicle(vehicleId);
          navigation.goBack();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Zoom Modal ─────────────────────────────────────────────── */}
      <Modal visible={zoomVisible} transparent animationType="fade" onRequestClose={() => setZoomVisible(false)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setZoomVisible(false)}>
            <X size={28} color={COLORS.text} />
          </TouchableOpacity>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
            maximumZoomScale={5}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image source={{ uri: photoUri }} style={styles.zoomedImage} resizeMode="contain" />
          </ScrollView>
        </View>
      </Modal>

      {/* ── Main Screen ─────────────────────────────────────────────── */}
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* Photo + action buttons */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageActions}>
            {/* Zoom button */}
            <TouchableOpacity style={styles.imageBtn} onPress={() => setZoomVisible(true)}>
              <ZoomIn size={20} color={COLORS.text} />
              <Text style={styles.imageBtnText}>تكبير</Text>
            </TouchableOpacity>
            {/* OCR button */}
            <TouchableOpacity
              style={[styles.imageBtn, styles.imageBtnOcr]}
              onPress={handleOCR}
              disabled={ocrLoading}
            >
              {ocrLoading
                ? <ActivityIndicator size="small" color={COLORS.text} />
                : <ScanLine size={20} color={COLORS.text} />
              }
              <Text style={styles.imageBtnText}>{ocrLoading ? 'جاري المسح...' : 'مسح اللوحة'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          
          <View style={styles.typeContainer}>
            {PLATE_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeBadge, plateType === type && styles.typeBadgeActive]}
                onPress={() => setPlateType(type)}
              >
                <Text style={[styles.typeText, plateType === type && styles.typeTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {plateType === 'تونسية' ? (
            <PlateInput
              ref={leftInputRef}
              leftNum={plateLeft}
              onLeftChange={setPlateLeft}
              rightNum={plateRight}
              onRightChange={setPlateRight}
              error={errors.plate}
            />
          ) : (
            <View style={{ marginBottom: 16 }}>
              <Input
                label="رقم اللوحة *"
                placeholder={plateType === 'إدارية' ? "مثال: 12345" : "مثال: AA-123-AA"}
                value={rawPlate}
                onChangeText={setRawPlate}
                keyboardType={plateType === 'إدارية' ? "numeric" : "default"}
                autoCapitalize="characters"
                error={errors.plate}
              />
            </View>
          )}

          <Input
            label="نوع السيارة"
            placeholder="ابدأ الكتابة..."
            value={make}
            onChangeText={setMake}
            error={errors.make}
          />
          <BrandPicker query={make} onSelect={setMake} />

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>الطابق / الموقع</Text>
            <View style={styles.floorContainer}>
              {FLOORS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.floorBadge, floor === f && styles.floorBadgeActive]}
                  onPress={() => setFloor(floor === f ? '' : f)}
                >
                  <Text style={[styles.floorText, floor === f && styles.floorTextActive]}>
                    {f === 'مأوى عام' ? f : `الطابق ${f}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button label="حذف" variant="destructive" icon={X} onPress={handleDiscard} />
            </View>
            <View style={{ flex: 2 }}>
              <Button label="حفظ" variant="success" icon={Check} onPress={handleSave} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  imageWrapper: { width: '100%', height: 260, backgroundColor: COLORS.mediaBackground, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageActions: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 },
  imageBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.mediaOverlay, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  imageBtnOcr: { backgroundColor: COLORS.mediaPrimaryOverlay },
  imageBtnText: { color: COLORS.text, marginLeft: 6, fontSize: 13, fontWeight: '600' },

  modalBg: { flex: 1, backgroundColor: COLORS.mediaModalBackground },
  modalClose: { position: 'absolute', top: 44, right: 20, zIndex: 10, padding: 8 },
  zoomedImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.3 },

  formContainer: { padding: 20, backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -16, paddingBottom: 40 },
  typeContainer: { flexDirection: 'row', justifyContent: 'center', backgroundColor: COLORS.background, borderRadius: 12, padding: 4, marginBottom: 20 },
  typeBadge: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  typeBadgeActive: { backgroundColor: COLORS.primary },
  typeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: 'bold' },
  typeTextActive: { color: COLORS.text },
  actions: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1, textAlign: 'right' },
  floorContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  floorBadge: { backgroundColor: COLORS.background, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  floorBadgeActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  floorText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  floorTextActive: { color: COLORS.text, fontWeight: 'bold' },
});
