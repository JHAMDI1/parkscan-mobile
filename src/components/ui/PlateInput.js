import React, { forwardRef, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

/**
 * Tunisian license plate input.
 * Format: [rightNum] تونس [leftNum]
 * Example: 123 تونس 4567
 *
 * Props:
 *  - leftNum, onLeftChange   → numbers on the LEFT of تونس  (e.g. 4567)
 *  - rightNum, onRightChange → numbers on the RIGHT of تونس (e.g. 123)
 *  - error
 */
export const PlateInput = forwardRef(({ 
  leftNum, 
  onLeftChange, 
  rightNum, 
  onRightChange, 
  error 
}, ref) => {
  const rightInputRef = useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>رقم اللوحة *</Text>

      {/* Visual plate */}
      <View style={[styles.plate, error && styles.plateError]}>

        {/* Right number (series) */}
        <TextInput
          ref={rightInputRef}
          style={styles.plateInput}
          value={rightNum}
          onChangeText={onRightChange}
          placeholder="123"
          placeholderTextColor={COLORS.border}
          keyboardType="numeric"
          maxLength={4}
          textAlign="center"
          returnKeyType="next"
          onSubmitEditing={() => ref?.current?.focus()}
        />

        {/* Fixed: تونس */}
        <View style={styles.middleSection}>
          <Text style={styles.middleTopText}>سيارات</Text>
          <Text style={styles.middleMainText}>تونس</Text>
        </View>

        {/* Left number (sequence) */}
        <TextInput
          ref={ref}
          style={styles.plateInput}
          value={leftNum}
          onChangeText={onLeftChange}
          placeholder="4567"
          placeholderTextColor={COLORS.border}
          keyboardType="numeric"
          maxLength={4}
          textAlign="center"
        />
      </View>

      {/* Preview */}
      {(leftNum || rightNum) ? (
        <Text style={styles.preview}>
          {rightNum || '...'} تونس {leftNum || '...'}
        </Text>
      ) : null}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { 
    color: COLORS.textMuted, 
    fontSize: 12, 
    fontWeight: '700', 
    marginBottom: 10, 
    letterSpacing: 1, 
    textAlign: 'right' 
  },
  plate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.plateBackground,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.plateBorder,
    overflow: 'hidden',
    height: 72,
  },
  plateError: { borderColor: COLORS.danger },
  plateInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.plateText,
    textAlign: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  middleSection: {
    backgroundColor: COLORS.plateBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: '100%',
    minWidth: 80,
  },
  middleTopText: {
    color: COLORS.plateTextLight,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  middleMainText: {
    color: COLORS.plateTextWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  errorText: { 
    color: COLORS.danger, 
    fontSize: 12, 
    marginTop: 4, 
    textAlign: 'right' 
  }
});
