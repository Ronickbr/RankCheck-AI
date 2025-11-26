import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export interface RankData {
  domain: string;
  rank: string;
  url: string;
  isTarget: boolean;
}

export interface RankingResult {
  keyword: string;
  summary: string;
  targetResult: RankData;
  competitorResults: RankData[];
  groundingSources: Array<{
    web?: { uri: string; title: string };
  }>;
}

export const checkKeywordRank = async (
  targetUrl: string,
  keyword: string,
  competitors: string[] = []
): Promise<RankingResult> => {
  const ai = getClient();
  
  const modelId = "gemini-2.5-flash";

  const competitorsText = competitors.length > 0 
    ? `\nTambém verifique as posições para estes concorrentes: ${competitors.join(", ")}` 
    : "";

  const prompt = `
    Atue como um especialista em SEO e verificador de SERP.
    
    Tarefa:
    1. Realize uma busca exaustiva no Google para a palavra-chave: "${keyword}".
    2. Localize o domínio ALVO "${targetUrl}" nos resultados (Top 100).
    ${competitorsText}
    
    Regras:
    - Analise até 100 resultados.
    - Para cada domínio (alvo e concorrentes), determine a posição exata.
    - Se não encontrar, reporte como "Não encontrado".
    
    Formato da Resposta (Siga ESTRITAMENTE este padrão para facilitar o processamento):
    
    Para o alvo principal:
    TARGET_DATA: RANK=[número ou 'Não encontrado'] | URL=[url completa ou 'N/A']
    
    Para CADA concorrente (se houver):
    COMP_DATA: DOMAIN=[dominio] | RANK=[número ou 'Não encontrado'] | URL=[url completa ou 'N/A']
    
    RESUMO: [Um breve resumo da performance comparativa]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Parse Target
    const targetMatch = text.match(/TARGET_DATA:\s*RANK=(.+?)\s*\|\s*URL=(.+)/i);
    const summaryMatch = text.match(/RESUMO:\s*(.+)/i);

    const targetResult: RankData = {
      domain: targetUrl,
      isTarget: true,
      rank: targetMatch ? targetMatch[1].trim() : "Indeterminado",
      url: targetMatch ? targetMatch[2].trim() : "N/A"
    };

    const summary = summaryMatch ? summaryMatch[1].trim() : text.slice(0, 150) + "...";

    // Parse Competitors
    const competitorResults: RankData[] = [];
    if (competitors.length > 0) {
      const compRegex = /COMP_DATA:\s*DOMAIN=(.+?)\s*\|\s*RANK=(.+?)\s*\|\s*URL=(.+)/gi;
      let match;
      while ((match = compRegex.exec(text)) !== null) {
        competitorResults.push({
          domain: match[1].trim(),
          isTarget: false,
          rank: match[2].trim(),
          url: match[3].trim()
        });
      }

      // Fallback: If regex fails but competitors were requested, try to ensure we return something for them based on original list
      if (competitorResults.length === 0 && competitors.length > 0) {
         // Simple fallback if format wasn't followed perfectly, or just return empty to show "Not Found" logic in UI
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const mappedSources = groundingChunks.map(chunk => ({
      web: chunk.web ? {
        uri: chunk.web.uri || "",
        title: chunk.web.title || ""
      } : undefined
    }));

    return {
      keyword,
      summary,
      targetResult,
      competitorResults,
      groundingSources: mappedSources,
    };
  } catch (error) {
    console.error(`Error checking keyword "${keyword}":`, error);
    throw error;
  }
};