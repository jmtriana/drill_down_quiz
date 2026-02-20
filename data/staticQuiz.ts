
import { QuizData } from '../types';

export const COMPANY_CLIENT_QUIZ: QuizData = {
  title: "Análisis de Estructura Bancaria",
  initialTotal: 1250000,
  initialMonetaryTotal: 4500, // En millones
  initialLabel: "Clientes Totales",
  description: "Exploración de la jerarquía de clientes: desde la división entre Personas y Empresas, hasta la segmentación por valor DVP/DAV y el estado final de Principalidad.",
  questions: [
    {
      id: "q1",
      text: "¿Cuál es la distribución de nuestra base entre los mundos de 'Personas' y 'Empresariales'?",
      options: ["980,000 Personas / 270,000 Empresariales", "850,000 Personas / 400,000 Empresariales"],
      optionValues: [980000, 270000],
      optionMonetaryValues: [3100, 1400],
      optionLabels: ["Personas", "Empresariales"],
      correctIndex: 0,
      segmentLabel: "Clientes Totales",
      explanation: "El 78% de nuestra base pertenece al mundo de Personas, lo que dicta nuestra estrategia de canales masivos."
    },
    {
      id: "q2",
      text: "Para el segmento de Personas, ¿cómo se distribuyen los grupos DVP, Comunes y DAV?",
      options: ["125k DVP / 710k Comunes / 145k DAV", "200k DVP / 600k Comunes / 180k DAV"],
      optionValues: [125000, 710000, 145000],
      optionMonetaryValues: [1800, 950, 350],
      optionLabels: ["Exclusivos DVP", "Comunes", "Exclusivos DAV"],
      correctIndex: 0,
      segmentLabel: "Personas",
      explanation: "La segmentación DVP/Comunes/DAV es exclusiva del mundo Personas para diferenciar propuestas de valor de alto patrimonio."
    },
    {
      id: "q3",
      text: "En el grupo Exclusivos DVP (Personas), ¿cuántos clientes se encuentran en estado 'Activo'?",
      options: ["92,500 Activos", "32,500 Inactivos"],
      optionValues: [92500, 32500],
      optionMonetaryValues: [1650, 150],
      optionLabels: ["Activos", "Inactivos"],
      correctIndex: 0,
      segmentLabel: "Exclusivos DVP",
      explanation: "La actividad en DVP es superior a la media del banco, con un 74% de clientes transando mensualmente."
    },
    {
      id: "q4",
      text: "Cambiando a Empresariales, ¿cuál es la tasa de actividad de este universo?",
      options: ["180,000 Activos / 90,000 Inactivos", "150,000 Activos / 120,000 Inactivos"],
      optionValues: [180000, 90000],
      optionMonetaryValues: [1250, 150],
      optionLabels: ["Activos", "Inactivos"],
      correctIndex: 0,
      segmentLabel: "Empresariales",
      explanation: "El mundo empresarial mantiene una inactividad del 33%, principalmente en microempresas estacionales."
    },
    {
      id: "q5",
      text: "De los clientes DVP Activos (Personas), ¿cuántos han alcanzado el estado de 'Principalidad'?",
      options: ["58,400 Principal", "34,100 No Principal"],
      optionValues: [58400, 34100],
      optionMonetaryValues: [1420, 230],
      optionLabels: ["Principal", "No Principal"],
      correctIndex: 0,
      segmentLabel: "DVP Activos",
      explanation: "La principalidad es nuestro KPI norte. Estos 58.4k clientes concentran el 60% del margen ordinario de Personas."
    },
    {
      id: "q6",
      text: "Finalmente, ¿cuántas de nuestras empresas activas nos consideran su banco principal?",
      options: ["112,000 Principal / 68,000 No Principal", "80,000 Principal / 100,000 No Principal"],
      optionValues: [112000, 68000],
      optionMonetaryValues: [1050, 200],
      optionLabels: ["Principal", "No Principal"],
      correctIndex: 0,
      segmentLabel: "Empresariales Activos",
      explanation: "Lograr que una empresa sea principal significa gestionar su dispersión de nómina y recaudo, asegurando la fidelidad del flujo de caja."
    }
  ]
};

export const HIERARCHY_MAP: Record<string, any> = {
  "Empresariales": {
    labels: ["Activos", "Inactivos"],
    values: [180000, 90000],
    monetary: [1250, 150],
    principality: [112000, 68000],
    principalityMonetary: [1050, 200]
  },
  "Comunes": {
    labels: ["Activos", "Inactivos"],
    values: [500000, 210000],
    monetary: [750, 200],
    principality: [315000, 185000],
    principalityMonetary: [600, 150]
  },
  "Exclusivos DAV": {
    labels: ["Activos", "Inactivos"],
    values: [110000, 35000],
    monetary: [300, 50],
    principality: [68200, 41800],
    principalityMonetary: [250, 50]
  }
};
