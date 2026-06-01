export interface BotonImpulso {
  timestamp: string; 
  type: 'papel' | 'jabon' | 'aseo' | 'agua';
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
  const types: ('papel' | 'jabon' | 'aseo' | 'agua')[] = ['papel', 'jabon', 'aseo', 'agua'];
  
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
      id: 1,
      name: "Opain - El Dorado",
      cities: [
        {
          name: "Bogotá",
          sedes: []
        }
      ]
    },
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
    },
    {
      id: 3,
      name: "Sodexo Corporativo",
      cities: [
        {
          name: "Bogotá",
          sedes: []
        },
        {
          name: "Barranquilla",
          sedes: []
        }
      ]
    }
  ];

  let restroomId = 100;

  // --- 1. Opain - El Dorado (Bogotá) ---
  const opainBogota = clients[0].cities[0].sedes;
  
  // Sede 1: Terminal 1
  opainBogota.push({
    id: 101,
    name: "Terminal 1 - Muelle Internacional",
    restrooms: [
      generateRestroomData(11, "Baño Zona Embarque A1", "MIXTO", "PISO 2 - SALAS DE ESPERA", ["ASEO"], 2.5),
      generateRestroomData(restroomId++, "Baño Zona Embarque B2", "MIXTO", "PISO 2 - SALAS DE ESPERA", ["PAPEL"], 2.0),
      generateRestroomData(restroomId++, "Baño Banda de Equipajes", "MIXTO", "PISO 1 - LLEGADAS", ["JABON"], 1.8),
      generateRestroomData(restroomId++, "Baño Hall Principal", "MIXTO", "PISO 1 - ENTRADAS", [], 2.2),
      generateRestroomData(restroomId++, "Baño Zona de Comidas", "MIXTO", "PISO 3 - COMIDAS", ["AGUA"], 3.0),
    ]
  });

  // Sede 2: Terminal 2
  opainBogota.push({
    id: 102,
    name: "Terminal 2 - Puente Aéreo",
    restrooms: [
      generateRestroomData(13, "Baño Público Pasillo Central", "MIXTO", "PISO 1", ["PAPEL"], 1.5),
      generateRestroomData(restroomId++, "Baño Llegadas Nacionales", "MIXTO", "PISO 1", [], 1.4),
      generateRestroomData(restroomId++, "Baño Salas de Espera T2", "MIXTO", "PISO 2", [], 1.6),
    ]
  });

  // Sede 3: Carga y Logística
  opainBogota.push({
    id: 103,
    name: "Terminal de Carga y Logística",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Operarios Carga", "MIXTO", "PISO 1", [], 1.2),
      generateRestroomData(restroomId++, "Baño Oficinas Carga", "MIXTO", "PISO 2", [], 0.9),
    ]
  });

  // Sede 4: Muelle Nacional
  opainBogota.push({
    id: 104,
    name: "Terminal 1 - Muelle Nacional",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Muelle Nacional C1", "MIXTO", "PISO 2", [], 2.4),
      generateRestroomData(restroomId++, "Baño Muelle Nacional D2", "MIXTO", "PISO 2", [], 2.1),
    ]
  });

  // --- 2. Bancolombia (Bogotá, Medellín, Cali) ---
  // Bogotá
  const bancolombiaBogota = clients[1].cities[0].sedes;
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
  const bancolombiaMedellin = clients[1].cities[1].sedes;
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
  const bancolombiaCali = clients[1].cities[2].sedes;
  bancolombiaCali.push({
    id: 206,
    name: "Bancolombia - Sucursal Principal Cali",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Principal Cali Clientes", "MIXTO", "PISO 1", [], 1.6),
      generateRestroomData(restroomId++, "Baño Principal Cali Staff", "MIXTO", "PISO 2", [], 1.1),
    ]
  });

  // --- 3. Sodexo Corporativo (Bogotá, Barranquilla) ---
  // Bogotá
  const sodexoBogota = clients[2].cities[0].sedes;
  sodexoBogota.push({
    id: 301,
    name: "Sodexo - Centro de Distribución Calle 13",
    restrooms: [
      generateRestroomData(31, "Baño Operarios Planta 1", "HOMBRES", "PISO 1", ["JABON"], 1.5),
      generateRestroomData(restroomId++, "Baño Administrativos Piso 2", "MUJERES", "PISO 2", [], 1.1),
      generateRestroomData(restroomId++, "Baño Comedor Operativo", "MIXTO", "PISO 1", [], 1.6),
    ]
  });
  sodexoBogota.push({
    id: 302,
    name: "Sodexo - Sede Administrativa Calle 100",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Piso 3 Operaciones", "MIXTO", "PISO 3", [], 1.2),
      generateRestroomData(restroomId++, "Baño Piso 5 Finanzas", "MIXTO", "PISO 5", [], 1.1),
      generateRestroomData(restroomId++, "Baño Piso 7 Presidencia", "MIXTO", "PISO 7", [], 0.8),
    ]
  });

  // Barranquilla
  const sodexoBarranquilla = clients[2].cities[1].sedes;
  sodexoBarranquilla.push({
    id: 303,
    name: "Sodexo - Oficina Regional Norte",
    restrooms: [
      generateRestroomData(restroomId++, "Baño Oficina Barranquilla", "MIXTO", "PISO 1", [], 1.3),
      generateRestroomData(restroomId++, "Baño Bodega Barranquilla", "MIXTO", "PISO 1", [], 1.4),
    ]
  });

  return clients;
};

export const mockClients: ClientAccount[] = buildMockDatabase();