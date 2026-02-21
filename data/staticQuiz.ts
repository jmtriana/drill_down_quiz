
import { QuizData } from '../types';

export const COMPANY_CLIENT_QUIZ: QuizData = {
  title: "Análisis de Estructura Personas",
  initialTotal: 23400000,
  initialMonetaryTotal: 74000, // En millones
  initialLabel: "Clientes Personas",
  description: "Exploración de la jerarquía de clientes Personas: desde la segmentación por valor DVP/DAV hasta el estado final de Principalidad.",
  questions: [
    {
      id: "q1",
      text: "Para el universo de Personas, ¿cómo se distribuyen los grupos Davivienda, Comunes y Daviplata?",
      options: [
        "5M Davivienda / 15M Comunes / 3.4M Daviplata",
        "3.4M Davivienda / 17M Comunes / 3M Daviplata", 
        "2M Davivienda / 18M Comunes / 3.4M Daviplata",
        "4M Davivienda / 16M Comunes / 3.4M Daviplata"
      ],
      optionValues: [3400000, 17000000, 3000000],
      optionMonetaryValues: [9000, 23000, 42000],
      optionLabels: ["Exclusivos Davivienda", "Comunes", "Exclusivos Daviplata"],
      correctIndex: 1,
      segmentLabel: "Clientes Personas",
      explanation: "La segmentación por relacionamiento es la base para diferenciar propuestas de valor en el mundo Personas."
    },
    {
      id: "q2",
      text: "En el grupo Exclusivos Daviplata, ¿cuántos clientes se encuentran en estado 'Activo'?",
      options: [
        "1.5M Activos",
        "2.8M Activos",
        "2.2M Activos",
        "1.8M Activos"
      ],
      optionValues: [2200000, 800000],
      optionMonetaryValues: [38000, 4000],
      optionLabels: ["Activos", "Inactivos"],
      correctIndex: 2,
      segmentLabel: "Exclusivos Daviplata",
      explanation: "La actividad en el segmento Daviplata es crítica para la transaccionalidad digital."
    },
    {
      id: "q3",
      text: "De los clientes Daviplata Activos, ¿cuántos han alcanzado el estado de 'Principalidad'?",
      options: [
        "1.0M Principal",
        "1.4M Principal",
        "1.8M Principal",
        "0.8M Principal"
      ],
      optionValues: [1400000, 800000],
      optionMonetaryValues: [32000, 6000],
      optionLabels: ["Principal", "No Principal"],
      correctIndex: 1,
      segmentLabel: "Daviplata Activos",
      explanation: "La principalidad en Daviplata asegura la fidelidad del ecosistema de pagos."
    }
  ]
};

export const HIERARCHY_MAP: Record<string, any> = {
  "Comunes": {
    labels: ["Activos", "Inactivos"],
    values: [12000000, 5000000],
    monetary: [18000, 5000],
    principality: [7500000, 4500000],
    principalityMonetary: [14000, 4000]
  },
  "Exclusivos Davivienda": {
    labels: ["Activos", "Inactivos"],
    values: [2500000, 900000],
    monetary: [7000, 2000],
    principality: [1500000, 1000000],
    principalityMonetary: [5000, 2000]
  }
};
