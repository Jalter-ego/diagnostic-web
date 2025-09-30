import { GoogleGenerativeAI } from "@google/generative-ai";
import intro from './prompts/introduccion.txt?raw';
import restricciones from './prompts/restricciones.txt?raw';
import funcionalidades from './prompts/funcionalidades.txt?raw';
import enfermedadesDetalle from './prompts/enfermedades_detalle.txt?raw';
import anamnesisPrompt from './prompts/anamnesis.txt?raw';

const key = import.meta.env.VITE_GEMINI_KEY;

if (!key) {
  throw new Error('Missing Gemini API Key. Check your environment configuration.');
}

const ai = new GoogleGenerativeAI(key);

// Chat general
export async function main(message: string) {
  const chat = ai.getGenerativeModel({ model: "gemini-2.0-flash" }).startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `${intro}\n\n${restricciones}\n\n${funcionalidades}`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: intro,
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

// Enfermedades detalladas
export async function getDiseaseDetails(diseaseName: string) {
  const chat = ai.getGenerativeModel({ model: "gemini-2.0-flash" }).startChat({
    history: [
      {
        role: "user",
        parts: [{ text: enfermedadesDetalle }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Soy un asistente médico especializado en dermatología. Proporcionaré información detallada y estructurada sobre enfermedades de la piel cuando me indiques el nombre de la enfermedad.",
          },
        ],
      },
    ],
  });

  const prompt = `Proporciona información detallada sobre la enfermedad: ${diseaseName}`;
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
}

// ⬇️ ANAMNESIS: ahora retornamos también la sesión del chat
export async function startAnamnesis() {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: anamnesisPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Estoy listo para realizar una anamnesis médica simulada.",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage("Inicia la anamnesis para el paciente:");
  const response = await result.response;
  return { chat, response: response.text() };
}

// Continuar la anamnesis con una sesión existente
export async function continueAnamnesis(chatSession: any, userInput: string) {
  const result = await chatSession.sendMessage(userInput);
  const response = await result.response;
  return response.text();
}
