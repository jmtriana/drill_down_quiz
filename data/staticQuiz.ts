
import { QuizData } from '../types';

export const COMPANY_CLIENT_QUIZ: QuizData = {
  title: "Análisis de Estructura Bancaria",
  initialTotal: 1250000,
  initialLabel: "Clientes Totales",
  description: "Exploración de la jerarquía de clientes: desde la división entre Personas y Empresas, hasta la segmentación por valor DVP/DAV y el estado final de Principalidad.",
  questions: [
    {
      id: "q1",
      text: "¿Cuál es la distribución de nuestra base entre los mundos de 'Personas' y 'Empresariales'?",
      options: ["980,000 Personas", "270,000 Empresariales","1000 usuarios","2"],
      optionValues: [980000, 270000],
      optionLabels: ["Personas", "Empresariales"],
      correctIndex: 0,
      segmentLabel: "Clientes Totales",
      explanation: "El 78% de nuestra base pertenece al mundo de Personas, lo que dicta nuestra estrategia de canales digitales."
    },
    {
      id: "q2",
      text: "Para el segmento de Personas, ¿cómo se distribuyen los grupos DVP, Comunes y DAV?",
      options: ["125k DVP / 710k Comunes / 145k DAV", "200k DVP / 600k Comunes / 180k DAV"],
      optionValues: [125000, 710000, 145000],
      optionLabels: ["Exclusivos DVP", "Comunes", "Exclusivos DAV"],
      correctIndex: 0,
      segmentLabel: "Personas",
      explanation: "La segmentación DVP/Comunes/DAV es exclusiva del mundo Personas para diferenciar propuestas de valor."
    },
    {
      id: "q3",
      text: "En el grupo Exclusivos DVP, ¿cuántos clientes se encuentran en estado 'Activo'?",
      options: ["92,500 Activos", "32,500 Inactivos"],
      optionValues: [92500, 32500],
      optionLabels: ["Activos", "Inactivos"],
      correctIndex: 0,
      segmentLabel: "Exclusivos DVP",
      explanation: "Al analizar la actividad del DVP, revelamos también la actividad del resto de los segmentos para una visión 360°."
    },
    {
      id: "q4",
      text: "De los clientes DVP Activos, ¿cuántos han alcanzado el estado de 'Principalidad'?",
      options: ["58,400 Principal", "34,100 Sin Principalidad"],
      optionValues: [58400, 34100],
      optionLabels: ["Principalidad", "Sin Principalidad"],
      correctIndex: 0,
      segmentLabel: "DVP Activos",
      explanation: "La principalidad es el KPI final de compromiso. Estos 58.4k clientes representan nuestro núcleo de mayor valor."
    }
  ]
};

// Data for branches not directly part of the "Correct Path" in the quiz
export const HIERARCHY_MAP: Record<string, any> = {
  "Empresariales": {
    labels: ["Activos", "Inactivos"],
    values: [180000, 90000]
  },
  "Comunes": {
    labels: ["Activos", "Inactivos"],
    values: [500000, 210000]
  },
  "Exclusivos DAV": {
    labels: ["Activos", "Inactivos"],
    values: [110000, 35000]
  }
};
