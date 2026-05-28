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
const getSimulatedTime = (daysAgo: number, hour: number, minute: number = 20): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toISOString().split('T')[0];
  return `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

export const mockClients: ClientAccount[] = [
  {
    id: 1,
    name: "Opain - El Dorado",
    cities: [
      {
        name: "Bogotá",
        sedes: [
          {
            id: 101,
            name: "Terminal 1 - Muelle Internacional",
            restrooms: [
              {
                id: 11,
                name: "Baño Público - Zona de Embarque A1",
                type: "MIXTO",
                floor_name: "PISO 2 - SALAS DE ESPERA",
                active_alerts: ["ASEO"],
                visitas_historicas: [
                  // HOY: Tráfico denso de aeropuerto
                  { timestamp: getSimulatedTime(0, 7, 5) }, { timestamp: getSimulatedTime(0, 7, 15) }, { timestamp: getSimulatedTime(0, 7, 35) },
                  { timestamp: getSimulatedTime(0, 8, 10) }, { timestamp: getSimulatedTime(0, 8, 25) }, { timestamp: getSimulatedTime(0, 8, 40) }, { timestamp: getSimulatedTime(0, 8, 55) },
                  { timestamp: getSimulatedTime(0, 9, 12) }, { timestamp: getSimulatedTime(0, 9, 33) }, { timestamp: getSimulatedTime(0, 9, 50) },
                  { timestamp: getSimulatedTime(0, 10, 18) }, { timestamp: getSimulatedTime(0, 10, 42) },
                  // AYER
                  ...Array(28).fill(0).map((_, i) => ({ timestamp: getSimulatedTime(1, 7 + (i % 4), i * 2) })),
                  // SEMANA PASADA
                  ...Array(45).fill(0).map((_, i) => ({ timestamp: getSimulatedTime(7, 7 + (i % 4), i) })),
                  // MES PASADO
                  ...Array(80).fill(0).map((_, i) => ({ timestamp: getSimulatedTime(30, 7 + (i % 4), i) }))
                ],
                clicks_historicos: [
                  // HOY
                  { timestamp: getSimulatedTime(0, 7, 18), type: "aseo" },
                  { timestamp: getSimulatedTime(0, 7, 40), type: "papel" },
                  { timestamp: getSimulatedTime(0, 8, 12), type: "aseo" },
                  { timestamp: getSimulatedTime(0, 8, 45), type: "jabon" },
                  { timestamp: getSimulatedTime(0, 9, 20), type: "aseo" },
                  { timestamp: getSimulatedTime(0, 9, 55), type: "agua" },
                  { timestamp: getSimulatedTime(0, 10, 22), type: "aseo" },
                  // AYER
                  { timestamp: getSimulatedTime(1, 7, 30), type: "aseo" },
                  { timestamp: getSimulatedTime(1, 8, 15), type: "papel" },
                  { timestamp: getSimulatedTime(1, 9, 10), type: "jabon" },
                  // SEMANA PASADA
                  { timestamp: getSimulatedTime(7, 8, 10), type: "aseo" },
                  { timestamp: getSimulatedTime(7, 9, 40), type: "papel" }
                ]
              },
              {
                id: 12,
                name: "Baño Público - Banda de Equipajes",
                type: "MIXTO",
                floor_name: "PISO 1 - LLEGADAS",
                active_alerts: [],
                visitas_historicas: [
                  { timestamp: getSimulatedTime(0, 8, 5) }, { timestamp: getSimulatedTime(0, 8, 50) },
                  { timestamp: getSimulatedTime(0, 9, 15) }
                ],
                clicks_historicos: [
                  { timestamp: getSimulatedTime(0, 8, 12), type: "jabon" }
                ]
              }
            ]
          },
          {
            id: 102,
            name: "Terminal 2 - Puente Aéreo",
            restrooms: [
              {
                id: 13,
                name: "Baño Público Pasillo Central",
                type: "MIXTO",
                floor_name: "PISO 1",
                active_alerts: ["PAPEL"],
                visitas_historicas: [
                  { timestamp: getSimulatedTime(0, 7, 40) }, { timestamp: getSimulatedTime(0, 8, 10) }
                ],
                clicks_historicos: [
                  { timestamp: getSimulatedTime(0, 7, 45), type: "papel" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Bancolombia",
    cities: [
      {
        name: "Bogotá",
        sedes: [
          {
            id: 201,
            name: "Bancolombia - Sede Dirección General Centro",
            restrooms: [
              {
                id: 21,
                name: "Baño Torre A Piso 3",
                type: "HOMBRES",
                floor_name: "PISO 3",
                active_alerts: [],
                visitas_historicas: [{ timestamp: getSimulatedTime(0, 8, 30) }],
                clicks_historicos: [{ timestamp: getSimulatedTime(0, 8, 35), type: "papel" }]
              }
            ]
          }
        ]
      },
      {
        name: "Medellín",
        sedes: [
          {
            id: 202,
            name: "Bancolombia - Dirección General El Poblado",
            restrooms: [
              {
                id: 22,
                name: "Baño Clientes Lobby",
                type: "MIXTO",
                floor_name: "PISO 1",
                active_alerts: [],
                visitas_historicas: [{ timestamp: getSimulatedTime(0, 9, 10) }],
                clicks_historicos: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Sodexo Corporativo",
    cities: [
      {
        name: "Bogotá",
        sedes: [
          {
            id: 301,
            name: "Sodexo - Centro de Distribución Calle 13",
            restrooms: [
              {
                id: 31,
                name: "Baño Operarios Planta 1",
                type: "HOMBRES",
                floor_name: "PISO 1",
                active_alerts: ["JABON"],
                visitas_historicas: [{ timestamp: getSimulatedTime(0, 7, 50) }],
                clicks_historicos: [{ timestamp: getSimulatedTime(0, 7, 55), type: "jabon" }]
              }
            ]
          }
        ]
      }
    ]
  }
];