import { GoogleGenAI, Modality } from "@google/genai";

// Helper to strip the data:image/png;base64, part
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
};

export const generateExpandedImage = async (
  imageBase64: string,
  prompt: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const cleanBase64 = stripBase64Prefix(imageBase64);

  // We use the 'gemini-2.5-flash-image' model for editing/in-filling.
  // The prompt instructs it to treat the input as a composition where borders need filling.
  
  const fullPrompt = `
    This image contains a central subject surrounded by a blurred or empty background.
    Your task is to seamlessy EXTEND the central image into the surrounding area (outpainting).
    
    Instructions:
    1. Keep the sharp, central part of the image EXACTLY as it is. Do not modify the main subject.
    2. Replace the blurred/background borders with new, realistic content that matches the central image's scenery, lighting, and style.
    3. The transition must be invisible.
    4. ${prompt ? `Additional Context: ${prompt}` : 'Make it look like a natural wide-angle shot.'}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', 
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No image generated.");
    }

    // Find the image part
    const imagePart = parts.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("Response did not contain image data.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
