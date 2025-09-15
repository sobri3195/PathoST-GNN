
import { GoogleGenAI, Type } from '@google/genai';
import type { HpcResult, GeminiAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generatePrompt = (hpcData: HpcResult): string => {
  const geneList = hpcData.topGenes.map(g => `${g.name} (expression: ${g.expression.toFixed(2)})`).join(', ');
  return `
    Analyze the following simulated spatial transcriptomics data from a selected region of a whole-slide pathology image.
    
    Data Summary:
    - Estimated Cell Count: ${hpcData.cellCount}
    - Identified Spatial Clusters: ${hpcData.spatialClusters}
    - Top Expressed Genes: ${geneList}
    
    Based on this data, provide a concise analysis. The top genes include common markers: COL1A1 (fibroblasts), KRT19 (epithelial cells), CD45 (immune cells), and FN1 (extracellular matrix).
    
    Respond in JSON format according to the provided schema. The summary should be a brief, one-sentence interpretation. Potential cell types should be inferred from the gene list. The confidence score should reflect the certainty of the analysis based on the limited data provided.
  `;
};

export const performGeminiAnalysis = async (hpcData: HpcResult): Promise<GeminiAnalysis> => {
  const prompt = generatePrompt(hpcData);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A single sentence summarizing the potential state of the tissue region."
            },
            potentialCellTypes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of potential cell types present in the region based on gene markers."
            },
            confidence: {
              type: Type.NUMBER,
              description: "A confidence score from 0 to 100 for the analysis based on the provided data."
            }
          },
          required: ["summary", "potentialCellTypes", "confidence"]
        },
      }
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);

    return parsedResult as GeminiAnalysis;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback in case of API error
    return {
      summary: "Could not analyze data due to an API error. Please check your API key and network connection.",
      potentialCellTypes: ["Error"],
      confidence: 0,
    };
  }
};
