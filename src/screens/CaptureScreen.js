import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { vehicleService } from '../services/vehicleService';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

export const CaptureScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [draftCount, setDraftCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadDraftCount();
    }, [])
  );

  const loadDraftCount = async () => {
    try {
      const drafts = await vehicleService.getAllDrafts();
      setDraftCount(drafts.length);
    } catch (e) {
      console.log(e);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>طلب إذن الكاميرا</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>منح الإذن</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        const filename = `photo_${Date.now()}.jpg`;
        const permanentUri = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: photo.uri, to: permanentUri });
        
        await vehicleService.addDraft(permanentUri);
        setDraftCount(prev => prev + 1);
        
      } catch (error) {
        console.error(error);
        Alert.alert('خطأ', 'فشل التقاط الصورة');
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" animateShutter={false} />
      <View style={styles.overlay}>
        <View style={styles.stats}>
          <Text style={styles.statsText}>{draftCount} مسودة (Brouillons)</Text>
        </View>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { color: COLORS.text, fontSize: 18, marginBottom: 20 },
  btn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 },
  btnText: { color: COLORS.text },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column', justifyContent: 'space-between', padding: 20 },
  stats: { alignSelf: 'center', backgroundColor: COLORS.overlay, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 40 },
  statsText: { color: COLORS.text, fontWeight: 'bold' },
  captureButton: { alignSelf: 'center', marginBottom: 40, width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: COLORS.text, justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.text }
});
