
import { GoogleGenAI } from "@google/genai";
import { Order } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDailySummary(orders: Order[]): Promise<string> {
  const finishedOrders = orders.filter(o => o.isPaid);
  const totalSales = finishedOrders.reduce((acc, o) => acc + o.total, 0);
  const deliveryCount = finishedOrders.filter(o => o.type === 'DELIVERY').length;
  const tableCount = finishedOrders.filter(o => o.type === 'TABLE').length;

  const prompt = `
    Como um consultor especialista em restaurantes, analise os dados de vendas de hoje:
    - Total de Vendas: R$ ${totalSales.toFixed(2)}
    - Pedidos Delivery: ${deliveryCount}
    - Pedidos em Mesa: ${tableCount}
    - Total de Pedidos: ${finishedOrders.length}

    Crie um resumo curto e motivador para a equipe, destacando o desempenho do dia e dando uma dica de melhoria para amanhã.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Não foi possível gerar o resumo automático.";
  } catch (error) {
    console.error("Erro no Gemini:", error);
    return "Erro ao processar resumo inteligente.";
  }
}
