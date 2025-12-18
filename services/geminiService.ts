import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const polishMessage = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return text;

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `Rewrite the following chat message to be clear, friendly, and grammatically correct. Do not add quotes or explanations, just output the polished text: "${text}"`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Failed to polish message:", error);
    return text; // Fallback to original
  }
};
