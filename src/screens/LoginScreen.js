import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserCheck } from 'lucide-react-native';

const MASTER_PASSWORD = process.env.EXPO_PUBLIC_APP_PASSWORD || 'a123';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = Password, 2 = Profile
  
  // Phase 1
  const [password, setPassword] = useState('');
  
  // Phase 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricule, setMatricule] = useState('');

  const [errors, setErrors] = useState({});

  const handlePasswordSubmit = () => {
    if (password === MASTER_PASSWORD) {
      setErrors({});
      setStep(2);
    } else {
      setErrors({ password: 'كلمة المرور غير صحيحة' });
    }
  };

  const handleProfileSubmit = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'مطلوب';
    if (!lastName.trim()) newErrors.lastName = 'مطلوب';
    if (!matricule.trim()) newErrors.matricule = 'مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    login({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      matricule: matricule.trim(),
      timestamp: new Date().toISOString()
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Image source={require('../../assets/logo.jpg')} style={styles.logoImage} />
          <Text style={styles.title}>الوحدة الأمنية المركزية</Text>
          <Text style={styles.subtitle}>نظام تسجيل بيانات السيارات</Text>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Text style={styles.stepTitle}>تسجيل الدخول</Text>
              <Input
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور..."
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />
              <Button label="دخول" icon={LogIn} onPress={handlePasswordSubmit} style={{ marginTop: 12 }} />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>بيانات الموظف</Text>
              <Input
                label="الاسم *"
                placeholder="مثال: أحمد"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
              />
              <Input
                label="اللقب *"
                placeholder="مثال: بن علي"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
              />
              <Input
                label="الرقم الموحد (Matricule) *"
                placeholder="مثال: 12345"
                value={matricule}
                onChangeText={setMatricule}
                keyboardType="numeric"
                error={errors.matricule}
              />
              <Button label="بدء العمل" variant="success" icon={UserCheck} onPress={handleProfileSubmit} style={{ marginTop: 12 }} />
            </>
          )}
        </View>

      </View>
      <Text style={styles.footerText}>Powered by JOUINI HAMDI 2026</Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoImage: { 
    width: 100, height: 100, 
    borderRadius: 50, 
    borderWidth: 2, borderColor: COLORS.primary, 
    marginBottom: 16 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  footerText: { textAlign: 'center', color: COLORS.textSubdued, fontSize: 12, marginBottom: 20 }
});
