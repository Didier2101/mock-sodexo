import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface FilterContextType {
  selectedDate: string;
  selectedHour: number;
  setSelectedDate: (date: string) => void;
  setSelectedHour: (hour: number) => void;
  getTodayStr: () => string;
}

const FilterContext = createContext<FilterContextType | null>(null);

// Helper para obtener la fecha de hoy en formato YYYY-MM-DD en la zona horaria local
export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayStr());
  
  // Por defecto, la hora activa es la hora actual del sistema (ej. 14 para las 14:15)
  const [selectedHour, setSelectedHour] = useState<number>(() => new Date().getHours());

  // Cada vez que cambie la fecha de consulta:
  // Si cambia a un día anterior, por defecto seleccionamos la hora 23 (final del día)
  // Si cambia al día de hoy, seleccionamos la hora actual del sistema
  useEffect(() => {
    const today = getTodayStr();
    if (selectedDate === today) {
      setSelectedHour(new Date().getHours());
    } else {
      setSelectedHour(23); // Última hora del día seleccionado
    }
  }, [selectedDate]);

  return (
    <FilterContext.Provider
      value={{
        selectedDate,
        selectedHour,
        setSelectedDate,
        setSelectedHour,
        getTodayStr,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilter debe ser utilizado dentro de FilterProvider');
  }
  return ctx;
}
