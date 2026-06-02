export interface BotonImpulso {
  timestamp: string;
  type: 'papel' | 'jabon' | 'aseo' | 'olor';
}

export interface VisitaRegistro {
  timestamp: string;
}

export interface RestroomSensor {
  id: number;
  name: string;
  type: string;
  floor_name: string;
  visitas_historicas: VisitaRegistro[];
  clicks_historicos: BotonImpulso[];
  active_alerts: string[];
}

export interface LocationSede {
  id: number;
  name: string;
  restrooms: RestroomSensor[];
}

export interface CityData {
  name: string;
  sedes: LocationSede[];
}

export interface ClientAccount {
  id: number;
  name: string;
  cities: CityData[];
}

// Helper para simular marcas de tiempo consistentes
export const getSimulatedTime = (daysAgo: number, hour: number, minute: number = 20): string => {
  const d = new Date('2026-06-30T12:00:00');
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

// Generador de visitas consistentes distribuidas en las 24 horas del día (con cobertura total de horas)
const generateVisits = (daysAgo: number, count: number): VisitaRegistro[] => {
  const list: VisitaRegistro[] = [];

  // Garantizar al menos 2 visitas en cada una de las 24 horas
  for (let hour = 0; hour < 24; hour++) {
    list.push({ timestamp: getSimulatedTime(daysAgo, hour, 10) });
    list.push({ timestamp: getSimulatedTime(daysAgo, hour, 40) });
  }

  // Distribuir el conteo restante si es mayor al mínimo establecido (48)
  const remaining = Math.max(0, count - 48);
  for (let i = 0; i < remaining; i++) {
    const hour = i % 24;
    const minute = (i * 7 + 15) % 60;
    list.push({ timestamp: getSimulatedTime(daysAgo, hour, minute) });
  }

  return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Generador de clics en botones de sensores consistentes a lo largo del día (con cobertura total de horas y tipos)
const generateClicks = (daysAgo: number, count: number): BotonImpulso[] => {
  const list: BotonImpulso[] = [];
  const types: ('papel' | 'jabon' | 'aseo' | 'olor')[] = ['papel', 'jabon', 'aseo', 'olor'];

  // Garantizar al menos 1 click en cada una de las 24 horas
  for (let hour = 0; hour < 24; hour++) {
    const type = types[hour % 4];
    list.push({ timestamp: getSimulatedTime(daysAgo, hour, 25), type });
  }

  // Distribuir los clicks restantes
  const remaining = Math.max(0, count - 24);
  for (let i = 0; i < remaining; i++) {
    const hour = i % 24;
    const minute = (i * 13 + 5) % 60;
    const type = types[(i + hour) % 4];
    list.push({ timestamp: getSimulatedTime(daysAgo, hour, minute), type });
  }

  return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Generador de baños con volumen controlado por escala poblando TODOS los días (0 a 60)
const generateRestroomData = (id: number, name: string, type: string, floor_name: string, active_alerts: string[], scale: number = 1.0) => {
  const visitas_historicas: VisitaRegistro[] = [];
  const clicks_historicos: BotonImpulso[] = [];

  for (let d = 0; d <= 60; d++) {
    let countVisits = 0;
    let countClicks = 0;

    if (d === 0) {
      countVisits = Math.round(60 * scale);
      countClicks = Math.round(15 * scale);
    } else if (d === 1) {
      countVisits = Math.round(90 * scale);
      countClicks = Math.round(22 * scale);
    } else if (d <= 7) {
      countVisits = Math.round((70 + d * 6) * scale);
      countClicks = Math.round((18 + d * 1.5) * scale);
    } else {
      countVisits = Math.round((100 + (d % 7) * 8) * scale);
      countClicks = Math.round((22 + (d % 7) * 1.8) * scale);
    }

    visitas_historicas.push(...generateVisits(d, countVisits));
    clicks_historicos.push(...generateClicks(d, countClicks));
  }

  return {
    id,
    name,
    type,
    floor_name,
    active_alerts,
    visitas_historicas,
    clicks_historicos
  };
};


const buildMockDatabase = (): ClientAccount[] => {
  const clients: ClientAccount[] = [
    {
      id: 2,
      name: "Bancolombia",
      cities: [
        {
          name: "Bogotá",
          sedes: []
        },
        {
          name: "Medellín",
          sedes: []
        },
        {
          name: "Cali",
          sedes: []
        }
      ]
    }
  ];

  let restroomId = 100;

  // --- Bancolombia (Bogotá, Medellín, Cali) ---
  // Bogotá
  const bancolombiaBogota = clients[0].cities[0].sedes;
  bancolombiaBogota.push({
    id: 201,
    name: "Bancolombia - Sede Dirección General Centro",
    restrooms: [
      generateRestroomData(21, "Baño Torre A Piso 3", "HOMBRES", "PISO 3", [], 1.4),
      generateRestroomData(restroomId++, "Baño Torre B Piso 4", "MUJERES", "PISO 4", [], 1.3),
      generateRestroomData(restroomId++, "Baño Lobby Principal", "MIXTO", "PISO 1", [], 1.8),
      generateRestroomData(restroomId++, "Baño Piso 10 Directivos", "MIXTO", "PISO 10", [], 0.8),
    ]
  });
  bancolombiaBogota.push({
    id: 203,
    name: "Bancolombia - Sucursal Unicentro",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Clientes Unicentro", "MIXTO", "PISO 1", [], 1.7),
      generateRestroomData(restroomId++, "Baño Empleados Unicentro", "MIXTO", "PISO 2", [], 1.0),
    ]
  });
  bancolombiaBogota.push({
    id: 204,
    name: "Bancolombia - Sede Teleport Calle 116",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Torre Teleport P2", "MIXTO", "PISO 2", [], 1.3),
      generateRestroomData(restroomId++, "Baño Torre Teleport P5", "MIXTO", "PISO 5", [], 1.2),
    ]
  });

  // Medellín
  const bancolombiaMedellin = clients[0].cities[1].sedes;
  bancolombiaMedellin.push({
    id: 202,
    name: "Bancolombia - Sede El Poblado",
    restrooms: [
      generateRestroomData(22, "Baño Clientes Lobby Poblado", "MIXTO", "PISO 1", [], 1.9),
      generateRestroomData(restroomId++, "Baño Empleados Sótano 1", "MIXTO", "PISO 1", [], 1.1),
      generateRestroomData(restroomId++, "Baño Torre Sur Piso 5", "HOMBRES", "PISO 5", [], 1.4),
      generateRestroomData(restroomId++, "Baño Torre Norte Piso 8", "MUJERES", "PISO 8", [], 1.3),
    ]
  });
  bancolombiaMedellin.push({
    id: 205,
    name: "Bancolombia - Sede Industriales",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Industriales P1", "MIXTO", "PISO 1", [], 1.5),
      generateRestroomData(restroomId++, "Baño Industriales P3", "MIXTO", "PISO 3", [], 1.2),
    ]
  });

  // Cali
  const bancolombiaCali = clients[0].cities[2].sedes;
  bancolombiaCali.push({
    id: 206,
    name: "Bancolombia - Sucursal Principal Cali",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Principal Cali Clientes", "MIXTO", "PISO 1", [], 1.6),
      generateRestroomData(restroomId++, "Baño Principal Cali Staff", "MIXTO", "PISO 2", [], 1.1),
    ]
  });

  return clients;
};

export const mockClients: ClientAccount[] = buildMockDatabase();