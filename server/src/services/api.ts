// En app/services/api.ts
const API_URL = 'http://192.168.100.96:3000/api/habits'; // ¡Usa la IP de tu backend!

// Definimos una interfaz para la respuesta, ¡ayuda a evitar errores!
export interface HabitSummary {
  habit_id: number;
  name: string;
  goal_type: string;
  daily_goal: number | null;
  total: number;
}

export const fetchHabitSummary = async (userId: number, from: string, to: string): Promise<HabitSummary[]> => {
  const response = await fetch(`${API_URL}/summary?user_id=${userId}&from=${from}&to=${to}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener el resumen de hábitos');
  }
  
  const data = await response.json();
  return data;
};

export const fetchActivityDates = async (userId: number, from: string, to: string): Promise<string[]> => {
  // --- ESTA ES LA LÍNEA CORREGIDA ---
  // Se quitó el "/habits" extra para formar la URL correcta.
  const url = new URL(`${API_URL}/logs/by-date`);
  
  url.searchParams.append('user_id', userId.toString());
  url.searchParams.append('from', from);
  url.searchParams.append('to', to);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Falló la petición de fechas de actividad');
  }
  return await response.json();
};


export interface DailyLog {
  name: string;
  daily_goal: number | null;
  amount: number | null;
}

// Y la nueva función de fetch
export const fetchDailyLog = async (userId: number, date: string): Promise<DailyLog[]> => {
  const url = new URL(`${API_URL}/logs/${date}?user_id=${userId}`);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Falló la petición del log diario');
  }
  return await response.json();
}

export const fetchUserStreak = async (userId: number): Promise<{ streak: number }> => {
  // Asumiendo que la base de tu API es http://<IP>:3000/api
  const response = await fetch(`http://192.168.100.96:3000/api/users/${userId}/streak`);
  if (!response.ok) {
    throw new Error('Falló la petición de racha');
  }
  return await response.json();
}

export interface NewHabit {
  user_id: number;
  name: string;
  goal_type: 'count' | 'check'; // Puede ser de conteo o simple check
  daily_goal?: number | null;
}

// Nueva función para crear un hábito
export const createHabit = async (habit: NewHabit): Promise<any> => {
  const url = `http://192.168.100.96:3000/api/habits`; // Usa tu IP

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habit),
  });

  if (!response.ok) {
    throw new Error('No se pudo crear el hábito');
  }

  return await response.json();
};