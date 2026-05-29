import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as XLSX from 'xlsx';
import { vehicleService } from '../services/vehicleService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, Sheet, Download, Trash2, Edit2, LogOut } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const HistoryScreen = () => {
  const { worker, logout } = useAuth();
  const [newVehicles, setNewVehicles] = useState([]);
  const [exportedVehicles, setExportedVehicles] = useState([]);
  const [tab, setTab] = useState('NEW'); // 'NEW' or 'EXPORTED'
  const scrollRef = React.useRef(null);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadSavedVehicles();
    }, [])
  );

  const loadSavedVehicles = async () => {
    try {
      const newD = await vehicleService.getAllSaved(0);
      const expD = await vehicleService.getAllSaved(1);
      setNewVehicles(newD);
      setExportedVehicles(expD);
    } catch (e) {
      console.error(e);
    }
  };

  const applyFilters = (list) => list.filter(v => {
    const matchesQuery = (v.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.make && v.make.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFloor = floorFilter ? v.floor === floorFilter : true;
    return matchesQuery && matchesFloor;
  });

  const filteredNewVehicles = applyFilters(newVehicles);
  const filteredExportedVehicles = applyFilters(exportedVehicles);

  // Decide which list we are operating on for exports
  const activeVehicles = tab === 'NEW' ? filteredNewVehicles : filteredExportedVehicles;

  const deleteVehicle = (id) => {
    Alert.alert('حذف', 'هل أنت متأكد من حذف هذه السيارة؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم', style: 'destructive',
        onPress: async () => {
          await vehicleService.deleteVehicle(id);
          loadSavedVehicles();
        }
      }
    ]);
  };

  const exportCSV = async () => {
    if (activeVehicles.length === 0) return;
    try {
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const currentDate = now.toLocaleDateString('fr-FR');
      const fileNameBase = `Rapport_TPS_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
      const officialHeader = `وزارة الداخلية\t\t\t\t\t\tتونس في: ${currentDate}\nإدارة الوحدة الأمنية المركزية\n\n`;
      const workerInfo = `الموظف: ${worker?.firstName || ''} ${worker?.lastName || ''} | الرقم الموحد: ${worker?.matricule || ''}\n\n`;
      
      const groups = activeVehicles.reduce((acc, v) => {
        const f = v.floor || 'غير محدد';
        if (!acc[f]) acc[f] = [];
        acc[f].push(v);
        return acc;
      }, {});

      let csvContent = '\uFEFF' + officialHeader + workerInfo;

      Object.entries(groups).forEach(([floor, vehicles]) => {
        const floorTitle = floor === 'مأوى عام' ? 'السيارات الإدارية مأوى عام بمأوى TPS' :
                           floor === 'غير محدد' ? 'السيارات الإدارية (غير محدد) بمأوى TPS' :
                           `السيارات الإدارية الطابق ${floor} بمأوى TPS`;
        csvContent += `${floorTitle}\n`;
        csvContent += 'ع/ر;نوع السيارة;الترقيم المنجمي;الوقت;التاريخ\n';
        const rows = vehicles.map((v, i) => `${i + 1};${v.make};${v.plate};${v.time};${v.date}`).join('\n');
        csvContent += rows + '\n\n';
      });

      const fileUri = FileSystem.documentDirectory + `${fileNameBase}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: 'utf8' });
      await Sharing.shareAsync(fileUri, { dialogTitle: 'تصدير إلى CSV', mimeType: 'text/csv' });
      promptMarkExported();
    } catch (error) {
      Alert.alert('خطأ', 'تعذر إنشاء ملف CSV.');
    }
  };

  const exportExcel = async () => {
    if (activeVehicles.length === 0) return;
    try {
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const currentDate = now.toLocaleDateString('fr-FR');
      const fileNameBase = `Rapport_TPS_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
      const ws = XLSX.utils.aoa_to_sheet([
        ['وزارة الداخلية', '', '', '', `تونس في: ${currentDate}`],
        ['إدارة الوحدة الأمنية المركزية'],
        [],
        [`الموظف: ${worker?.firstName || ''} ${worker?.lastName || ''}`],
        [`الرقم الموحد: ${worker?.matricule || ''}`],
        [],
      ]);

      const groups = activeVehicles.reduce((acc, v) => {
        const f = v.floor || 'غير محدد';
        if (!acc[f]) acc[f] = [];
        acc[f].push(v);
        return acc;
      }, {});

      let currentOrigin = 7;

      Object.entries(groups).forEach(([floor, vehicles]) => {
        const floorTitle = floor === 'مأوى عام' ? 'السيارات الإدارية مأوى عام بمأوى TPS' :
                           floor === 'غير محدد' ? 'السيارات الإدارية (غير محدد) بمأوى TPS' :
                           `السيارات الإدارية الطابق ${floor} بمأوى TPS`;
                           
        XLSX.utils.sheet_add_aoa(ws, [[floorTitle]], { origin: `A${currentOrigin}` });
        currentOrigin += 1;

        XLSX.utils.sheet_add_json(ws, vehicles.map((v, i) => ({
          'ع/ر': i + 1,
          'نوع السيارة': v.make,
          'الترقيم المنجمي': v.plate,
          'التاريخ': v.date,
          'الوقت': v.time
        })), { origin: `A${currentOrigin}` });

        currentOrigin += vehicles.length + 2; 
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "السيارات");
      const base64 = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });

      const fileUri = FileSystem.documentDirectory + `${fileNameBase}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'تصدير إلى Excel' });

      promptMarkExported();
    } catch (error) {
      Alert.alert('خطأ', 'تعذر إنشاء ملف Excel.');
    }
  };

  const exportPDF = async () => {
    if (activeVehicles.length === 0) return;
    try {
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const currentDate = now.toLocaleDateString('fr-FR');
      const fileNameBase = `Rapport_TPS_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
      
      const groups = activeVehicles.reduce((acc, v) => {
        const f = v.floor || 'غير محدد';
        if (!acc[f]) acc[f] = [];
        acc[f].push(v);
        return acc;
      }, {});

      let tablesHtml = '';
      Object.entries(groups).forEach(([floor, vehicles]) => {
        const floorTitle = floor === 'مأوى عام' ? 'السيارات الإدارية مأوى عام بمأوى TPS' :
                           floor === 'غير محدد' ? 'السيارات الإدارية (غير محدد) بمأوى TPS' :
                           `السيارات الإدارية الطابق ${floor} بمأوى TPS`;
        tablesHtml += `
          <h3 style="text-align: center; margin-top: 30px; text-decoration: underline;">${floorTitle}</h3>
          <table>
            <tr><th style="width: 10%;">ع/ر</th><th style="width: 30%;">نوع السيارة</th><th style="width: 30%;">الترقيم المنجمي</th><th style="width: 15%;">التاريخ</th><th style="width: 15%;">الوقت</th></tr>
            ${vehicles.map((v, i) => `<tr><td>${i + 1}</td><td>${v.make}</td><td class="plate" dir="rtl">${v.plate}</td><td>${v.date}</td><td>${v.time}</td></tr>`).join('')}
          </table>
        `;
      });

      const html = `
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: sans-serif; direction: rtl; margin: 0; padding: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #000; padding: 12px; text-align: center; }
              th { font-weight: bold; }
              .plate { direction: rtl; font-family: monospace; font-size: 16px; font-weight: bold; }
              .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
              .header-right { text-align: right; font-weight: bold; font-size: 18px; line-height: 1.5; }
              .header-left { text-align: left; font-weight: bold; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="header-container">
              <div class="header-right">
                وزارة الداخلية<br/>
                إدارة الوحدة الأمنية المركزية
              </div>
              <div class="header-left">
                تونس في: ${currentDate}
              </div>
            </div>
            <div style="padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #000;">
              <strong>الموظف:</strong> ${worker?.firstName || ''} ${worker?.lastName || ''} <br/>
              <strong>الرقم الموحد (Matricule):</strong> ${worker?.matricule || ''}
            </div>
            ${tablesHtml}
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      const newUri = FileSystem.documentDirectory + `${fileNameBase}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'تصدير إلى PDF' });

      promptMarkExported();
    } catch (error) {
      Alert.alert('خطأ', 'تعذر إنشاء ملف PDF.');
    }
  };

  const promptMarkExported = () => {
    if (tab === 'EXPORTED') return;
    Alert.alert(
      'تحديث السجل',
      'هل تريد نقل هذه السيارات إلى قائمة "تم التصدير" حتى لا يتم تصديرها مرة أخرى؟',
      [
        { text: 'لا', style: 'cancel' },
        {
          text: 'نعم، نقل',
          onPress: async () => {
            const ids = activeVehicles.map(v => v.id);
            await vehicleService.markAsExported(ids);
            loadSavedVehicles();
          }
        }
      ]
    );
  };

  const setTabAndScroll = (newTab, index) => {
    setTab(newTab);
    scrollRef.current?.scrollTo({ x: index * (SCREEN_WIDTH - 32), animated: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>إنهاء العمل</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{activeVehicles.length} سيارة {tab === 'NEW' ? 'جديدة' : 'مُصدّرة'}</Text>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'NEW' && styles.tabBtnActive]} onPress={() => setTabAndScroll('NEW', 0)}>
          <Text style={[styles.tabText, tab === 'NEW' && styles.tabTextActive]}>جديد (لم يتم التصدير)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'EXPORTED' && styles.tabBtnActive]} onPress={() => setTabAndScroll('EXPORTED', 1)}>
          <Text style={[styles.tabText, tab === 'EXPORTED' && styles.tabTextActive]}>تم التصدير (أرشيف)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Input
          placeholder="🔎 بحث برقم اللوحة أو النوع..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.floorFilters}>
          {['', '1', '2', '3', '4', 'مأوى عام'].map(f => (
            <TouchableOpacity
              key={f || 'all'}
              style={[styles.floorBtn, floorFilter === f && styles.floorBtnActive]}
              onPress={() => setFloorFilter(f)}
            >
              <Text style={[styles.floorBtnText, floorFilter === f && styles.floorBtnTextActive]}>
                {f === '' ? 'الكل' : (f === 'مأوى عام' ? f : `ط ${f}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'NEW' && (
        <View style={styles.exportRow}>
          <Button style={styles.exportBtn} variant="primary" icon={FileText} label="CSV" onPress={exportCSV} disabled={activeVehicles.length === 0} />
          <Button style={styles.exportBtn} variant="success" icon={Sheet} label="Excel" onPress={exportExcel} disabled={activeVehicles.length === 0} />
          <Button style={styles.exportBtn} variant="destructive" icon={Download} label="PDF" onPress={exportPDF} disabled={activeVehicles.length === 0} />
        </View>
      )}

      {/* HORIZONTAL SWIPER */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const index = Math.round(x / (SCREEN_WIDTH - 32));
          if (index === 0 && tab !== 'NEW') setTab('NEW');
          if (index === 1 && tab !== 'EXPORTED') setTab('EXPORTED');
        }}
        contentContainerStyle={{ flexGrow: 1 }}
      >

        {/* PAGE 1: NEW VEHICLES */}
        <View style={{ width: SCREEN_WIDTH - 32 }}>
          <FlatList
            data={filteredNewVehicles}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.photoUri }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPlate}>{item.plate}</Text>
                  <Text style={styles.cardMake}>{item.make} • الطابق: {item.floor}</Text>
                  <Text style={styles.cardTime}>{item.date} {item.time}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Drafts', { screen: 'Process', params: { vehicleId: item.id, photoUri: item.photoUri, existingPlate: item.plate, existingMake: item.make === 'غير معروف' ? '' : item.make, existingFloor: item.floor === '-' ? '' : item.floor } })}>
                    <Edit2 size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => deleteVehicle(item.id)}>
                    <Trash2 size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>لا يوجد سيارات جديدة.</Text>}
            nestedScrollEnabled
          />
        </View>

        {/* PAGE 2: EXPORTED VEHICLES */}
        <View style={{ width: SCREEN_WIDTH - 32 }}>
          <FlatList
            data={filteredExportedVehicles}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.photoUri }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPlate}>{item.plate}</Text>
                  <Text style={styles.cardMake}>{item.make} • الطابق: {item.floor}</Text>
                  <Text style={styles.cardTime}>{item.date} {item.time}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => deleteVehicle(item.id)}>
                    <Trash2 size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>لا يوجد سيارات مصدرة.</Text>}
            nestedScrollEnabled
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dangerLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  logoutText: { color: COLORS.danger, marginLeft: 6, fontSize: 12, fontWeight: 'bold' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  tabsContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: 'bold' },
  tabTextActive: { color: COLORS.text },

  filterSection: { marginBottom: 16 },
  floorFilters: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  floorBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: COLORS.surface, marginBottom: 4 },
  floorBtnActive: { backgroundColor: COLORS.primary },
  floorBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  floorBtnTextActive: { color: COLORS.text },

  exportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  exportBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 4 },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  cardImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardInfo: { flex: 1, alignItems: 'flex-start' },
  cardPlate: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardMake: { color: COLORS.textMuted, fontSize: 13, marginBottom: 2 },
  cardTime: { color: COLORS.textSubdued, fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8, marginLeft: 4 }
});
