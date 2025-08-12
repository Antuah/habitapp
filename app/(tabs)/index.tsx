import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import ConfettiCannon from 'react-native-confetti-cannon';
import Toast from 'react-native-toast-message';
import { HabitSummary, fetchHabitSummary, fetchUserStreak } from '../../server/src/services/api'; // Ajusta la ruta si es necesario

// --- Componente para cada hábito en la lista (sin cambios) ---
interface HabitDisplayCardProps {
  habit: HabitSummary;
  icon: string;
  color: string;
}
const HabitDisplayCard: React.FC<HabitDisplayCardProps> = ({ habit, icon, color }) => {
  const progress = habit.daily_goal ? Math.round(((habit.total || 0) / habit.daily_goal) * 100) : ((habit.total || 0) > 0 ? 100 : 0);

  return (
    <View style={styles.habitCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <FontAwesome5 name={icon} size={20} color={color} />
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitMeta}>{habit.daily_goal ? `${habit.total || 0} de ${habit.daily_goal}` : 'Completado'}</Text>
        </View>
      </View>
      <CircularProgress
        value={progress}
        radius={25}
        duration={1000}
        progressValueColor={'#555'}
        activeStrokeColor={color}
        inActiveStrokeColor={'#EAEAEA'}
        inActiveStrokeOpacity={0.5}
        activeStrokeWidth={6}
        inActiveStrokeWidth={6}
        valueSuffix={'%'}
        titleStyle={{ fontSize: 10 }}
      />
    </View>
  );
};


// --- Pantalla Principal Rediseñada ---
export default function TodayScreen() {
  const [habits, setHabits] = useState<HabitSummary[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('');

  // --- NUEVOS ESTADOS Y REFERENCIAS ---
  const [refreshing, setRefreshing] = useState(false);
  const previousHabitsRef = useRef<HabitSummary[] | undefined>(undefined);
  const confettiRef = useRef<ConfettiCannon>(null);

  const motivationalQuotes = [
    "La disciplina es el puente entre metas y logros.",
    "Un pequeño progreso cada día suma grandes resultados.",
    "La constancia es más importante que la perfección.",
    "El secreto para avanzar es empezar.",
    "Conviértete en la persona que quieres ser, un hábito a la vez."
  ];

  // --- LÓGICA DE DETECCIÓN DE CAMBIOS ---
  useEffect(() => {
    const previousHabits = previousHabitsRef.current;
    if (previousHabits && habits.length > 0) {
      habits.forEach(newHabit => {
        const oldHabit = previousHabits.find(h => h.habit_id === newHabit.habit_id);
        if (!oldHabit) return;

        const isNowComplete = newHabit.daily_goal ? newHabit.total >= newHabit.daily_goal : newHabit.total > 0;
        const wasPreviouslyComplete = oldHabit.daily_goal ? oldHabit.total >= oldHabit.daily_goal : oldHabit.total > 0;

        if (!wasPreviouslyComplete && isNowComplete) {
          Toast.show({
            type: 'success',
            text1: '¡Hábito Completado!',
            text2: `¡Felicidades por completar "${newHabit.name}"!`,
          });
          confettiRef.current?.start();
        }
      });
    }
    previousHabitsRef.current = habits;
  }, [habits]);

  // --- LÓGICA DE CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const userId = 1;
      const [habitsData, streakData] = await Promise.all([
        fetchHabitSummary(userId, today, today),
        fetchUserStreak(userId)
      ]);
      setHabits(habitsData);
      setStreak(streakData.streak);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carga inicial y frase motivacional
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    fetchData();
  }, [fetchData]);

  // Refrescar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      if (!loading) { // Evita recargar si aún está en la carga inicial
        fetchData();
      }
    }, [loading, fetchData])
  );

  // Función para el "Pull-to-Refresh"
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#6C63FF" /></View>;
  }
  
  const getHabitDetails = (habitName: string): { icon: string; color: string } => {
    const lowerCaseName = habitName.toLowerCase();
    if (lowerCaseName.includes('agua')) return { icon: 'tint', color: '#3498db' };
    if (lowerCaseName.includes('leer')) return { icon: 'book-open', color: '#9b59b6' };
    if (lowerCaseName.includes('ejercicio') || lowerCaseName.includes('correr')) return { icon: 'running', color: '#e74c3c' };
    if (lowerCaseName.includes('meditar')) return { icon: 'praying-hands', color: '#1abc9c' };
    return { icon: 'check-circle', color: '#2ecc71' };
  };

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.confettiContainer}>
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          ref={confettiRef}
          fadeOut
        />
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Hola de nuevo,</Text>
            <Text style={styles.headerUser}>Aleja 👋</Text>
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>{streak}</Text>
            <FontAwesome5 name="fire" size={24} color="#FF6B00" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Progreso de Hoy</Text>
        {habits.length > 0 ? (
          habits.map(habit => {
            const details = getHabitDetails(habit.name);
            return <HabitDisplayCard key={habit.habit_id} habit={habit} icon={details.icon} color={details.color} />;
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay hábitos para hoy.</Text>
            <Text style={styles.emptySubtitle}>Usa la pestaña 'Agregar' para empezar.</Text>
          </View>
        )}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS MEJORADOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  scrollContent: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: { fontSize: 22, color: '#667' },
  headerUser: { fontSize: 32, fontWeight: 'bold', color: '#223' },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  streakText: { fontSize: 22, fontWeight: 'bold', marginRight: 8, color: '#FF6B00' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  habitCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  habitInfo: {
    marginLeft: 15,
    flex: 1,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  habitMeta: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  quoteCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
});