import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { vehicleService } from '../services/vehicleService';
import { Check, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export const DraftListScreen = () => {
  const [drafts, setDrafts] = useState([]);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      loadDrafts();
    }, [])
  );

  const loadDrafts = async () => {
    try {
      const data = await vehicleService.getAllDrafts();
      setDrafts(data);
    } catch (e) {
      console.error('Erreur chargement brouillons:', e);
    }
  };

  const deleteDraft = (id) => {
    Alert.alert('حذف', 'هل أنت متأكد من حذف هذه الصورة؟', [
      { text: 'لا', style: 'cancel' },
      { 
        text: 'نعم', style: 'destructive',
        onPress: async () => {
          await vehicleService.deleteVehicle(id);
          loadDrafts();
        }
      }
    ]);
  };

  if (drafts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Check size={64} color={COLORS.success} />
        <Text style={styles.emptyTitle}>الكل محدث!</Text>
        <Text style={styles.emptySubtitle}>لا توجد صور أخرى للمعالجة.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drafts}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Process', { vehicleId: item.id, photoUri: item.photoUri })}
          >
            <Image source={{ uri: item.photoUri }} style={styles.image} />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteDraft(item.id)}>
              <Trash2 size={20} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  emptyTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { color: COLORS.textSubdued, fontSize: 16, marginTop: 8 },
  list: { padding: 8 },
  card: { flex: 1, margin: 8, height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.surface },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.dangerOverlay, padding: 8, borderRadius: 20 },
  badge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: COLORS.overlay, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: COLORS.text, fontSize: 12, fontWeight: 'bold' }
});
