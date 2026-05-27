import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_INSTRUCTION = `你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出條理清晰且可直接使用的會議摘要。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。`;

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: "50mb" }));

  // API router
  app.post("/api/generate", async (req: express.Request, res: express.Response) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "伺服器尚未配置 GEMINI_API_KEY 環境變數，請在 Settings > Secrets 面板中設定。",
        });
      }

      const { transcript, customInstruction } = req.body;

      if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
        return res.status(400).json({ error: "請提供會議內容或逐字稿。" });
      }

      const userPrompt = `
以下是本次會議的逐字稿或重點筆記內容：
=== 會議內容開始 ===
${transcript}
=== 會議內容結束 ===

【處理規格要求】：
1. 根據系統指令產出條理清晰的 Markdown 會議摘要。
2. 重點包含：會議主題、與會者、主要結論與共識、行動項目與負責人。
3. 不需要翻譯成其他語言。
4. 若有額外補充指令：${customInstruction ? `「${customInstruction}」` : "無"}，請一併納入摘要內容。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("AI 未能生成任何有效的會議記錄內容，請確認輸入後再試一次。");
      }

      res.json({ result: text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "處理會議記錄時發生未知錯誤，請稍後再試。",
      });
    }
  });

  // Serve static assets and Vite fallback (development uses Vite middleware)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
