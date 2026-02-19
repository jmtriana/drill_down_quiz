
import { GoogleGenAI } from "@google/genai";
import { Question, PlayerAnswer } from "../types";

export const analyzeResults = async (question: Question, answers: PlayerAnswer[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const voteDistribution = question.options.map((opt, i) => {
    const count = answers.filter(a => a.optionIndex === i).length;
    return `${opt}: ${count} votos`;
  }).join(", ");

  const prompt = `
    Actúa como un experto consultor bancario senior. 
    Estamos en un evento de estrategia.
    Pregunta realizada: "${question.text}"
    Resultados de la sala: ${voteDistribution}
    Respuesta correcta teórica: "${question.options[question.correctIndex]}"
    
    Proporciona un insight estratégico BREVE (máximo 25 palabras) sobre lo que estos resultados dicen de la percepción del equipo. 
    Sé agudo, profesional y motivador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating insight:", error);
    return "La diversidad de opiniones en la sala sugiere una oportunidad clave para alinear nuestra visión sobre la segmentación actual.";
  }
};
