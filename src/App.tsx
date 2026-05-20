import React, { useState, useEffect, useRef } from "react";
import MeetingInput from "./components/MeetingInput";
import MeetingOutput from "./components/MeetingOutput";
import HistoryList from "./components/HistoryList";
import { MeetingRecord, GenerationConfig } from "./types";
import { Sparkles, Calendar, HelpCircle, GraduationCap, ArrowUpRight, CheckCircle2, ChevronRight, X } from "lucide-react";

export default function App() {
  const [records, setRecords] = useState<MeetingRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<MeetingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load records from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("meeting_ai_records");
      if (stored) {
        const parsed = JSON.parse(stored) as MeetingRecord[];
        setRecords(parsed);
        if (parsed.length > 0) {
          setActiveRecord(parsed[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load records from localStorage", e);
    }
  }, []);

  // Save records to local storage when changed
  const saveRecords = (newRecords: MeetingRecord[]) => {
    setRecords(newRecords);
    try {
      localStorage.setItem("meeting_ai_records", JSON.stringify(newRecords));
    } catch (e) {
      console.error("Failed to save records to localStorage", e);
    }
  };

  // Start cyclical simulated load phrases during network requests
  const startLoadingSteps = () => {
    setLoadingStep(0);
    stepIntervalRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 3800);
  };

  const stopLoadingSteps = () => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  };

  // Triggers API processing
  const handleGenerate = async (config: GenerationConfig) => {
    setIsLoading(true);
    setErrorText(null);
    startLoadingSteps();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: config.transcript,
          targetLanguage: config.targetLanguage,
          tone: config.tone,
          sections: config.sections
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `伺服器連線失敗 (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error("AI 產出回傳格式不正確，未能取得生成文本。");
      }

      // Automatically construct an elegant title
      const today = new Date();
      const formatDate = today.toISOString().split("T")[0];
      const limitTitleText = config.transcript
        .replace(/【.*?】/g, "")
        .replace(/[\r\n]/g, " ")
        .trim()
        .substring(0, 18);
      const generatedTitle = limitTitleText 
        ? `會議紀錄: ${limitTitleText}...` 
        : `會議紀錄 (${formatDate})`;

      const newRecord: MeetingRecord = {
        id: `rec-${today.getTime()}`,
        title: generatedTitle,
        date: formatDate,
        rawText: config.transcript,
        processedText: data.result,
        tone: config.tone,
        targetLanguage: config.targetLanguage,
        sections: config.sections
      };

      const updatedRecords = [newRecord, ...records];
      saveRecords(updatedRecords);
      setActiveRecord(newRecord);
    } catch (err: any) {
      console.error("Generation Error:", err);
      setErrorText(err.message || "連線至 Google Gemini API 時發生問題，請確認網路與 Secrets 設定。");
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
    if (activeRecord?.id === id) {
      setActiveRecord(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleClearAll = () => {
    saveRecords([]);
    setActiveRecord(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#4A4A40] font-sans antialiased pb-12 flex flex-col">
      {/* Upper Navigation Header */}
      <header className="bg-[#F5F5F0] border-b border-[#DEDECF] sticky top-0 z-45 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base md:text-xl text-[#2C2C24] tracking-tight flex items-center gap-2">
                <span>智議 AI 助手</span>
              </div>
              <p className="text-[10px] md:text-xs text-[#8A8A7A] uppercase tracking-wider font-semibold hidden sm:block">
                Meeting Intelligence & Translation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5A5A40] hover:text-[#4A4A30] bg-[#FDFBF7] hover:bg-[#EFEFEA] flex items-center gap-1.5 transition-all border border-[#DEDECF] cursor-pointer shadow-2xs animate-fade-in"
              id="guide-toggle-btn"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>使用指南與小技巧</span>
            </button>
            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-[#5A5A40] bg-[#EFEFEA] hover:bg-[#DEDECF]/50 px-3.5 py-2 rounded-xl transition-all hidden md:flex items-center gap-1 border border-[#DEDECF]"
            >
              <span>Google AI Studio</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Grid Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 flex flex-col">
        {/* Error messaging bar */}
        {errorText && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs md:text-sm flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs" id="error-bar">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded-full bg-red-100 text-red-650 font-bold text-xs mt-0.5">⚠️</span>
              <div>
                <p className="font-bold mb-0.5">無法呼叫 AI 模型做分析整理</p>
                <p className="opacity-90">{errorText}</p>
                <p className="mt-1.5 text-[11px] text-red-600">※ 解決方案：請確認您在 AI Studio 的 <strong>Settings &gt; Secrets</strong> 面板中，已成功綁定名稱為 <code>GEMINI_API_KEY</code> 的金鑰環境變數，且已重啟開發伺服器。</p>
              </div>
            </div>
            <button
              onClick={() => setErrorText(null)}
              className="text-xs bg-red-100 hover:bg-red-200/80 text-red-800 px-3 py-1.5 rounded-lg font-bold transition-all"
              id="error-close-btn"
            >
              我知道了
            </button>
          </div>
        )}

        {/* Informative Help Guide Card */}
        {showGuide && (
          <div className="mb-6 bg-[#5A5A40] text-[#FDFBF7] rounded-3xl p-6 relative overflow-hidden transition-all shadow-md border border-[#4A4A30]" id="tips-guide-card">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#DEDECF] hover:text-white"
              id="guide-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="p-2 bg-white/10 rounded-xl text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-sm tracking-wide text-white">💡 智議專家小教室：如何產出完美的會議記錄？</h3>
                <ol className="text-xs text-stone-250 space-y-2 list-decimal pl-4 leading-relaxed">
                  <li>
                    <strong>發言角色標記</strong>：在逐字稿中附帶發言人稱呼，如：<code className="bg-black/10 text-white px-1.5 py-0.5 rounded">主席 Betty：我們先討論...</code>，這能幫助 AI 追蹤並精確指派行動代辦人。
                  </li>
                  <li>
                    <strong>風格因地制宜</strong>：對於決策匯報，使用<strong className="text-white">【精簡執行摘要】</strong>；若需完整還原討論過程與爭執點，建議選用<strong className="text-white">【詳盡全備大師】</strong>。
                  </li>
                  <li>
                    <strong>善用客製化指令</strong>：在下方備註欄輸入「要求產出預算明細對照表格」或「加註待確認事項的主責部門」，AI 秘書將能百分百配合您的合規排版。
                  </li>
                  <li>
                    <strong>專業雙向翻譯</strong>：對照翻譯區塊包含具備跨國集團商務高度的專用單字與行話，能直接用於跨國主管日常工作簡報。
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Content layout: 2-column or 3-column split view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="app-main-grid">
          {/* Left panel: Inputs & Options (7 Columns) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6" id="app-left-panel">
            <MeetingInput onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Right panel: Results, Previews & Local Storage (5 Columns) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col" id="app-right-panel">
            {/* Output block */}
            <MeetingOutput
              processedText={activeRecord ? activeRecord.processedText : null}
              isLoading={isLoading}
              activeLoadingStep={loadingStep}
            />

            {/* Storage history card */}
            <HistoryList
              records={records}
              activeRecordId={activeRecord ? activeRecord.id : null}
              onSelectRecord={(r) => setActiveRecord(r)}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>

      {/* Decorative localized footer */}
      <footer className="mt-auto pt-16 pb-4 text-center text-xs text-[#8A8A7A] font-medium" id="app-footer">
        <p>© 2026 智議 AI 助手 • 自然色調風格 (Natural Tones) 研製</p>
        <p className="text-[10px] text-[#A0A090] mt-1.5">
          本系統由 Google Gemini 3.5 Flash 驅動且運作於安全的全棧伺服器端
        </p>
      </footer>
    </div>
  );
}
