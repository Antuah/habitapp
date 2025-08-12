import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createHabit, NewHabit } from '../../server/src/services/api'; // Ajusta la ruta si es necesario

// --- SOLUCIÓN: Definir los tipos para los props del componente ---
interface SuggestionCardProps {
  icon: string;
  name: string;
  color: string;
  onSelect: (name: string) => void;
}

// Aplicamos la interfaz al componente con React.FC
const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, name, color, onSelect }) => (
  <TouchableOpacity style={[styles.suggestionCard, { backgroundColor: color }]} onPress={() => onSelect(name)}>
    <FontAwesome5 name={icon} size={24} color="white" />
    <Text style={styles.suggestionText}>{name}</Text>
  </TouchableOpacity>
);

export default function AddHabitScreen() {
  const [name, setName] = useState('');
  const [isQuantitative, setIsQuantitative] = useState(false);
  const [goal, setGoal] = useState('');
  
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isGoalFocused, setIsGoalFocused] = useState(false);

  const router = useRouter();

  const handleSelectSuggestion = (suggestionName: string) => {
    setName(suggestionName);
    const lowerCaseName = suggestionName.toLowerCase();
    if (lowerCaseName.includes('agua') || lowerCaseName.includes('páginas') || lowerCaseName.includes('correr')) {
      setIsQuantitative(true);
      setGoal('');
    } else {
      setIsQuantitative(false);
    }
  };

  const handleSaveHabit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del hábito no puede estar vacío.');
      return;
    }
    if (isQuantitative && (!goal.trim() || Number(goal) <= 0)) {
        Alert.alert('Error', 'La meta debe ser un número mayor a cero.');
        return;
    }

    const newHabit: NewHabit = {
      user_id: 1,
      name: name.trim(),
      goal_type: isQuantitative ? 'count' : 'check',
      daily_goal: isQuantitative ? Number(goal) : null,
    };

    try {
      await createHabit(newHabit);
      Toast.show({
        type: 'success',
        text1: '¡Hábito Creado!',
        text2: `El hábito "${newHabit.name}" fue añadido.`,
      });
      router.replace('/(tabs)'); 
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear el hábito.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Crea tu Hábito</Text>
            <Text style={styles.headerSubtitle}>Empieza con una idea o personaliza la tuya.</Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Ideas para Empezar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContainer}>
              <SuggestionCard icon="tint" name="Beber Agua" color="#3498db" onSelect={handleSelectSuggestion} />
              <SuggestionCard icon="book-open" name="Leer 10 Páginas" color="#9b59b6" onSelect={handleSelectSuggestion} />
              <SuggestionCard icon="running" name="Correr 1km" color="#e74c3c" onSelect={handleSelectSuggestion} />
              <SuggestionCard icon="praying-hands" name="Meditar" color="#1abc9c" onSelect={handleSelectSuggestion} />
            </ScrollView>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>O Créalo a tu Gusto</Text>
            <View style={[styles.inputContainer, isNameFocused && styles.inputContainerFocused]}>
              <FontAwesome5 name="pencil-alt" size={20} color={isNameFocused ? '#6C63FF' : '#999'} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre del Hábito"
                placeholderTextColor="#AAA"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            <View style={styles.switchCard}>
              <View style={styles.switchTextContainer}>
                <Feather name="target" size={20} color="#555" style={styles.icon} />
                <Text style={styles.switchLabel}>¿Tiene una meta numérica?</Text>
              </View>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#C7C0FF" }}
                thumbColor={isQuantitative ? "#6C63FF" : "#f4f3f4"}
                onValueChange={() => setIsQuantitative(previousState => !previousState)}
                value={isQuantitative}
              />
            </View>
            
            {isQuantitative && (
              <View style={[styles.inputContainer, styles.goalInput, isGoalFocused && styles.inputContainerFocused]}>
                <FontAwesome5 name="hashtag" size={20} color={isGoalFocused ? '#6C63FF' : '#999'} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Meta (ej. 8)"
                  placeholderTextColor="#AAA"
                  keyboardType="number-pad"
                  value={goal}
                  onChangeText={setGoal}
                  onFocus={() => setIsGoalFocused(true)}
                  onBlur={() => setIsGoalFocused(false)}
                />
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSaveHabit}>
              <Text style={styles.buttonText}>Añadir Hábito</Text>
              <FontAwesome5 name="check" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


// --- ESTILOS (sin cambios) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#223',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#667',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334',
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 15,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  suggestionCard: {
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  suggestionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  form: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  inputContainerFocused: {
    borderColor: '#6C63FF',
    shadowColor: '#6C63FF',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  switchTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  goalInput: {
    marginTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});