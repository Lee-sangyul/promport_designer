import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini AI
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, userInput } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "프롬프트 내용이 누락되었습니다." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 서버 환경 변수에 설정되지 않았습니다. Settings > Secrets 패널에서 API 키를 설정해 주세요."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct final system text
      let finalPrompt = prompt;
      if (userInput && userInput.trim()) {
        finalPrompt = `${prompt}\n\n[처리해야 할 실제 사용자 입력 값]:\n${userInput}`;
      }

      // Basic text model gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: finalPrompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Gemini API 호출 중 서버 오류가 발생했습니다." });
    }
  });

  // API Route for Polishing Prompts
  app.post("/api/gemini/polish", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "다듬을 프롬프트 내용이 누락되었습니다." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 서버 환경 변수에 설정되지 않았습니다. Settings > Secrets 패널에서 API 키를 설정해 주세요."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = 
        "당신은 세계 최고 성능의 LLM 프롬프트 전문 엔지니어(Prompt Engineer)입니다. " +
        "사용자가 제공한 원본 프롬프트를 분석하여, 인공지능이 더 명확하고 일관되며 최상의 결과를 도출할 수 있도록 '정교하게 다듬고 보완된 고품질 프롬프트'로 업그레이드해 주어야 합니다.\n\n" +
        "**준수해야 할 필수 원칙**:\n" +
        "1. **원본 핵심 내용과 요구 조건 보존**: 페르소나(역할), 상황 및 맥락, 구체적인 수행 과제(Task), 필수 포함 조건, 부정/배제어, 추가 규칙, 포맷 등을 절대로 훼손하거나 빠뜨려서는 안 되며, 오히려 더 구체적이고 세련되게 다듬어야 합니다.\n" +
        "2. **구조적 개선**: 가독성이 비약적으로 향상되도록 Markdown(마크다운) 타이틀, 서식, 구분 기호, 대괄호[], 블릿포인트 등을 활용하여 논리적으로 깔끔하게 구조화하십시오.\n" +
        "3. **명확한 지시어 강화**: 모호하거나 직관적이지 않은 문구는 고해상도의 지시 문장으로 보강하십시오. 어조와 대상에 맞추어 지침을 명문화하세요.\n" +
        "4. **프롬프트 내용만 출력**: 서론(예: '다듬은 결과입니다')이나 결론, 추가 설명이나 안내 메시지를 절대로 포함하지 마십시오. 오직 정교화된 최종 완성형 프롬프트 텍스트만 그대로 출력해야 합니다. 마크다운 코드블록(```)으로 감싸지 마십시오.";

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Polish API Error:", error);
      res.status(500).json({ error: error.message || "Gemini API 호출 중 서버 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
