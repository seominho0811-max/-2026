
import { GoogleGenAI } from "@google/genai";
import { AdmissionData } from "../types";

export async function generateDataInsights(data: AdmissionData[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = data.slice(0, 50).map(d => 
    `${d.university} (${d.major}): 내신 ${d.gpa.toFixed(2)}, 결과 ${d.status}`
  ).join(', ');

  const prompt = `
    다음은 2026학년도 수시 모집 데이터의 일부입니다.
    데이터 요약: ${summary}
    전체 레코드 수: ${data.length}개
    
    이 데이터를 분석하여 다음 항목에 대해 한국어로 전문적인 인사이트를 제공해주세요:
    1. 전체적인 지원 및 합격 동향 (합격, 충원합격, 불합 비중 등)
    2. 대학 및 학과별 합격권 내신 분석
    3. 수험생들을 위한 전략적 제언
    4. 데이터에서 발견된 특이사항이나 패턴
    
    답변은 Markdown 형식으로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "분석 결과를 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 중 오류가 발생했습니다.";
  }
}
