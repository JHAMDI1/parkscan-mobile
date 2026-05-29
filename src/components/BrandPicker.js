import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ALL_BRANDS } from '../constants/brands';
import { COLORS } from '../constants/theme';

export const BrandPicker = ({ query, onSelect }) => {
  const filteredBrands = query.trim() === '' 
    ? ALL_BRANDS.slice(0, 8) 
    : ALL_BRANDS.filter(brand => brand.toLowerCase().includes(query.toLowerCase()));

  if (filteredBrands.length === 0) return null;

  return (
    <View style={styles.container}>
      {filteredBrands.map(brand => (
        <TouchableOpacity key={brand} style={styles.badge} onPress={() => onSelect(brand)}>
          <Text style={styles.text}>{brand}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8, justifyContent: 'flex-end' },
  badge: { backgroundColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  text: { color: COLORS.text, fontSize: 14 }
});
