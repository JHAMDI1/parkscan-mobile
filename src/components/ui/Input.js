import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export const Input = forwardRef(({ 
  label, 
  error, 
  ...props 
}, ref) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textSubdued}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1, textAlign: 'right' },
  input: { 
    backgroundColor: COLORS.background, 
    color: COLORS.text, 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    textAlign: 'right' 
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4, textAlign: 'right' }
});
