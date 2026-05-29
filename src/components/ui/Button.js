import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export const Button = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  icon: Icon, 
  disabled = false,
  style 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive': return styles.buttonDestructive;
      case 'outline': return styles.buttonOutline;
      case 'success': return styles.buttonSuccess;
      default: return styles.buttonPrimary;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getVariantStyles(), disabled && styles.disabled, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      {Icon && <Icon size={20} color={COLORS.text} style={styles.icon} />}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonPrimary: { backgroundColor: COLORS.primary },
  buttonDestructive: { backgroundColor: COLORS.danger },
  buttonSuccess: { backgroundColor: COLORS.success },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.textSubdued },
  disabled: { opacity: 0.5 },
  text: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  icon: { marginRight: 8 }
});
