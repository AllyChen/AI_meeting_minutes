# AI Meeting Minutes

簡短說明：這是以 React + Vite 建構、Express 提供後端 API，並整合 Google Gemini (`@google/genai`) 的會議紀錄產生專案。

## 本地開發

需求：Node.js、npm

1. 安裝套件：

```bash
npm install
```

2. 設定環境變數（在專案根目錄建立 `.env` 或使用 Render 的環境變數設定）：

- `GEMINI_API_KEY`：Google Gemini / GenAI API Key

3. 啟動開發伺服器：

```bash
npm run dev
```

## 在 Render 部署

建議的 Render Web Service 設定：

- **Environment**: `Node`
- **Root Directory**: repository 根目錄
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Instance Port**: Render 會提供 `PORT` 環境變數（程式會自動使用 `process.env.PORT`）

必須在 Render 的環境變數設定中加入：

- `GEMINI_API_KEY`：你的 Gemini API Key

部署後，Render 會執行 `npm run build`，產生 `dist` 靜態檔案並用 `npm start` 啟動 `dist/server.cjs`。

如果你需要我為專案產生 `render.yaml` 或自動化部署設定，告訴我我會幫你產生。
