import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { BarChart } from 'react-native-chart-kit';
// --- SOLUCIÓN 1: AÑADIR FontAwesome5 a la importación ---
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { DailyLog, fetchActivityDates, fetchDailyLog, fetchHabitSummary, HabitSummary } from '../../server/src/services/api'; // Ajusta la ruta si es necesario


// Configuración en español para el calendario
LocaleConfig.locales['es'] = {
    monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthNamesShort: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
    dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    dayNamesShort: ['Dom.','Lun.','Mar.','Mié.','Jue.','Vie.','Sáb.'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';


// Componente para las tarjetas de estadísticas (con tipos)
interface StatCardProps {
  label: string;
  value: string | number;
}
const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Componente para cada item en el modal de detalle diario
interface DailyLogItemProps {
  log: DailyLog;
}
const DailyLogItem: React.FC<DailyLogItemProps> = ({ log }) => {
  const isCompleted = log.daily_goal ? (log.amount || 0) >= log.daily_goal : (log.amount || 0) > 0;
  const progress = log.daily_goal ? ((log.amount || 0) / log.daily_goal) * 100 : (isCompleted ? 100 : 0);
  
  const getIconName = (habitName: string) => {
    const lowerCaseName = habitName.toLowerCase();
    if (lowerCaseName.includes('agua')) return 'tint';
    if (lowerCaseName.includes('leer')) return 'book-open';
    if (lowerCaseName.includes('ejercicio') || lowerCaseName.includes('correr')) return 'running';
    return 'check-circle';
  };

  return (
    <View style={styles.logItem}>
      <FontAwesome5 name={getIconName(log.name)} size={24} color={isCompleted ? '#28a745' : '#6C63FF'} style={styles.logIcon} />
      <View style={styles.logDetails}>
        <View style={styles.logHeader}>
          <Text style={styles.logName}>{log.name}</Text>
          <Text style={styles.logProgressText}>{log.amount || 0} / {log.daily_goal || '1'}</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: isCompleted ? '#28a745' : '#6C63FF' }]} />
        </View>
      </View>
      {isCompleted && <FontAwesome name="check-circle" size={24} color="#28a745" style={styles.checkIcon} />}
    </View>
  );
};


// --- PANTALLA DE PROGRESO ---
export default function ProgressScreen() {
  const [summaryData, setSummaryData] = useState<HabitSummary[]>([]);
  type MarkedDatesType = { [date: string]: { selected: boolean; selectedColor: string; }; };
  const [markedDates, setMarkedDates] = useState<MarkedDatesType>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [dailyData, setDailyData] = useState<DailyLog[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    const loadProgressData = async () => {
      setLoading(true);
      const userId = 1;
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const fromDate = new Date(year, month, 1).toISOString().split('T')[0];
      const toDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      try {
        const [summary, activityDates] = await Promise.all([
          fetchHabitSummary(userId, fromDate, toDate),
          fetchActivityDates(userId, fromDate, toDate)
        ]);
        
        setSummaryData(summary);
        const datesToMark = activityDates.reduce<MarkedDatesType>((acc, date) => {
          acc[date] = { selected: true, selectedColor: '#6C63FF' };
          return acc;
        }, {});
        setMarkedDates(datesToMark);
      } catch (error) {
        console.error("Error al cargar datos de progreso:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProgressData();
  }, [currentMonth]);


  const onDayPress = async (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
    setLoadingModal(true);
    try {
      const logs = await fetchDailyLog(1, day.dateString);
      setDailyData(logs);
    } catch (error) {
      console.error("Error al cargar el detalle del día:", error);
      setDailyData([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const chartData = {
    labels: summaryData.map(h => h.name.substring(0, 10)),
    datasets: [{ data: summaryData.map(h => h.total) }]
  };
  const totalCompletions = summaryData.reduce((count, habit) => {
    if (habit.daily_goal && habit.daily_goal > 0) {
      if (habit.total >= habit.daily_goal) return count + 1;
    } else {
      if (habit.total > 0) return count + 1;
    }
    return count;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {loading ? (
            <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#6C63FF" />
        ) : (
            <>
                <Text style={styles.title}>Tu Progreso</Text>
                <View style={styles.statsContainer}>
                    <StatCard label="Total Completados" value={totalCompletions} />
                    <StatCard label="Hábitos Activos" value={summaryData.length} />
                </View>
                <Text style={styles.sectionTitle}>Calendario de Actividad</Text>
                <Calendar
                    current={currentMonth.toISOString().split('T')[0]}
                    markedDates={markedDates}
                    onMonthChange={(month) => setCurrentMonth(new Date(month.timestamp))}
                    onDayPress={onDayPress}
                    maxDate={new Date().toISOString().split('T')[0]}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        arrowColor: '#6C63FF',
                        todayTextColor: '#6C63FF',
                    }}
                    style={styles.calendar}
                />
                <Text style={styles.sectionTitle}>Resumen de Hábitos (Este Mes)</Text>
                {summaryData.length > 0 ? (
                    <BarChart
                        data={chartData}
                        width={Dimensions.get('window').width - 32}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: '#FFFFFF',
                            backgroundGradientFrom: '#FFFFFF',
                            backgroundGradientTo: '#FFFFFF',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={styles.chart}
                        fromZero
                        showValuesOnTopOfBars
                    />
                ) : (
                    <Text style={styles.emptyText}>No hay datos para mostrar en el gráfico.</Text>
                )}
            </>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.grabber} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={22} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Progreso del {selectedDate}</Text>
            {loadingModal ? (
              <ActivityIndicator size="large" color="#6C63FF" />
            ) : (
              // --- SOLUCIÓN 2: AÑADIR EL TIPO GENÉRICO A FlatList ---
              <FlatList<DailyLog>
                data={dailyData}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => <DailyLogItem log={item} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay actividad registrada este día.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 30 },
    sectionTitle: { fontSize: 20, fontWeight: '600', paddingHorizontal: 16, marginTop: 24, marginBottom: 10 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 8, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF' },
    statLabel: { fontSize: 14, color: 'gray', marginTop: 4 },
    emptyText: { textAlign: 'center', color: 'gray', padding: 20, fontSize: 16 },
    calendar: { marginHorizontal: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    chart: { marginVertical: 8, borderRadius: 16, alignSelf: 'center' },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        minHeight: '40%',
        maxHeight: '80%',
    },
    grabber: {
        width: 60,
        height: 5,
        backgroundColor: '#CCC',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    logIcon: {
        width: 30,
        textAlign: 'center',
    },
    logDetails: {
        flex: 1,
        marginLeft: 15,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    logName: {
        fontSize: 16,
        fontWeight: '500',
    },
    logProgressText: {
        fontSize: 14,
        color: '#333',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#EAEAEA',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    checkIcon: {
        marginLeft: 10,
    }
});