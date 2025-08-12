import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- SOLUCIÓN: Definir los tipos para los props del componente ---
interface BenefitCardProps {
  icon: string;
  title: string;
  text: string;
}

// Aplicamos la interfaz al componente con React.FC
const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, text }) => (
  <View style={styles.benefitCard}>
    <FontAwesome5 name={icon} size={28} color="#6C63FF" />
    <Text style={styles.benefitTitle}>{title}</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Encabezado --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transforma tu Vida</Text>
          <Text style={styles.headerSubtitle}>Descubre el poder de crear pequeños hábitos diarios.</Text>
        </View>

        {/* --- Sección de Beneficios --- */}
        <View style={styles.benefitsGrid}>
          <BenefitCard 
            icon="heartbeat" 
            title="Mejora tu Salud" 
            text="Pequeños cambios como beber más agua o caminar a diario tienen un impacto enorme." 
          />
          <BenefitCard 
            icon="brain" 
            title="Claridad Mental" 
            text="La meditación y la lectura reducen el estrés y aumentan tu enfoque y creatividad." 
          />
          <BenefitCard 
            icon="rocket" 
            title="Aumenta Productividad" 
            text="Organizar tu día y cumplir metas te da un impulso de energía y motivación." 
          />
          <BenefitCard 
            icon="smile-beam" 
            title="Bienestar General" 
            text="Construir hábitos positivos mejora tu autoestima y te acerca a la persona que quieres ser." 
          />
        </View>

        {/* --- Sección de Contenido --- */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>La Ciencia Detrás de un Hábito</Text>
          <Text style={styles.contentText}>
            Tu cerebro crea atajos para las tareas que repites. Al ser constante, una acción que al principio requiere esfuerzo se vuelve automática. Este ciclo de señal, rutina y recompensa es la clave para un cambio duradero. ¡Cada repetición fortalece el camino!
          </Text>
        </View>

        {/* --- Llamada a la Acción (CTA) --- */}
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(tabs)/add')}>
          <Text style={styles.ctaText}>Crea tu Primer Hábito</Text>
          <FontAwesome5 name="arrow-right" size={16} color="white" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS (sin cambios) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#223',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#667',
    textAlign: 'center',
    marginTop: 8,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  benefitCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    width: '42%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  contentCard: {
    backgroundColor: 'white',
    margin: 25,
    borderRadius: 20,
    padding: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#667',
  },
  ctaButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 25,
    padding: 18,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});