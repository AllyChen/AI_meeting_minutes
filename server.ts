import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_INSTRUCTION = `你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
請務必遵守以下輸出格式要求：

1. **會議主題與時間**：擷取會議的主題與時間。
2. **與會者**：列出參與會議的人員。
3. **會議重點總結**：用 3 到 5 個重點總結會議內容。
4. **Action Items (待辦事項)**：明確列出接下來的待辦事項與負責人。
5. **[語言]翻譯版**：將上述 1~4 點的內容完整翻譯成專業的[語言]。

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

      const { transcript, targetLanguage, tone, sections } = req.body;

      if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
        return res.status(400).json({ error: "請提供會議內容或逐字稿。" });
      }

      let languageName = "英文";
      if (typeof targetLanguage === "string") {
        if (targetLanguage.includes("不翻譯")) {
          languageName = "繁體中文對照";
        } else {
          const match = targetLanguage.match(/^([^\s(]+)/);
          if (match) {
            languageName = match[1];
          }
        }
      }

      const dynamicSystemInstruction = SYSTEM_INSTRUCTION.replace(/\[語言\]/g, languageName);

      const selectedSectionsText = sections && Array.isArray(sections) && sections.length > 0
        ? sections.map((s: string) => `【${s}】`).join("、")
        : "會議主題與時間、與會者、會議重點總結、Action Items (待辦事項)、對照翻譯版";

      const userPrompt = `
以下是本次會議的逐字稿或重點筆記內容：
=== 會議內容開始 ===
${transcript}
=== 會議內容結束 ===

【處理規格要求】：
1. 請遵循系統指令的 5 點結構，生成高度專業、條理清晰的 Markdown 會議紀錄。
2. 目前的目標翻譯語言為：[${languageName}]。
3. 語氣與詳盡風格設定：[${tone || "專業商務標準"}]。
4. 如果有設定補充指令：${req.body.customInstruction ? `「${req.body.customInstruction}」` : "無額外指定"}，請一併在符合 5 點結構的前提下融入。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: dynamicSystemInstruction,
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
