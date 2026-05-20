import React, { useState } from "react";
import { SAMPLE_TRANSCRIPTS } from "../data/samples";
import { GenerationConfig } from "../types";
import { FileText, Languages, Sparkles, Sliders, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";

interface MeetingInputProps {
  onGenerate: (config: GenerationConfig) => void;
  isLoading: boolean;
}

export default function MeetingInput({ onGenerate, isLoading }: MeetingInputProps) {
  const [transcript, setTranscript] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("英文 (English)");
  const [tone, setTone] = useState("專業商務標準");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "會議概述",
    "核心議題與決議",
    "行動項目與待辦清單",
    "會議精華對照翻譯"
  ]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);

  const languages = [
    "英文 (English)",
    "日文 (Japanese)",
    "韓文 (Korean)",
    "西班牙文 (Spanish)",
    "法文 (French)",
    "德文 (German)",
    "不翻譯 (維持繁體中文)"
  ];

  const tones = [
    { name: "專業商務標準", desc: "客觀嚴謹，適合常規商務匯報" },
    { name: "精簡執行摘要", desc: "極速縮減，高階主管決策專用" },
    { name: "詳盡全備大師", desc: "完整保留脈絡、討論細節不遺漏" },
    { name: "生動活潑風格", desc: "活潑語音語氣，富有新創團隊活力" }
  ];

  const sectionsAvailable = [
    { key: "會議概述", label: "📊 會議概述 (Summary)", desc: "2-3 句精準大意" },
    { key: "核心議題與決議", label: "🎯 核心議題與決議 (Core Decisions)", desc: "條列討論點與共識" },
    { key: "行動項目與待辦清單", label: "✅ 行動項目 (Action Items)", desc: "指派是誰、什麼時候做" },
    { key: "會議精華對照翻譯", label: "🌐 會議精華對照翻譯 (Translation)", desc: "核心精要翻譯至目標語系" }
  ];

  const handleSectionToggle = (key: string) => {
    if (selectedSections.includes(key)) {
      setSelectedSections(selectedSections.filter((item) => item !== key));
    } else {
      setSelectedSections([...selectedSections, key]);
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_TRANSCRIPTS.find((s) => s.id === sampleId);
    if (sample) {
      setTranscript(sample.content);
      setActiveSampleId(sampleId);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setActiveSampleId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    let finalTranscript = transcript;
    if (customInstruction.trim()) {
      finalTranscript += `\n\n【使用者補充特殊指令】：${customInstruction}`;
    }

    onGenerate({
      transcript: finalTranscript,
      targetLanguage,
      tone,
      sections: selectedSections
    });
  };

  const wordCount = transcript.trim() ? transcript.trim().length : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs p-6 md:p-8" id="meeting-input-container">
      {/* Sample presets panel */}
      <div className="mb-6" id="sample-presets-panel">
        <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
          快速體驗：載入情境會議範本
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_TRANSCRIPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample.id)}
              className={`p-3.5 text-left rounded-xl border transition-all relative cursor-pointer ${
                activeSampleId === sample.id
                  ? "border-[#5A5A40] bg-[#FDFBF7] text-[#2C2C24] shadow-xs"
                  : "border-[#E5E5DF] hover:border-[#DEDECF] bg-[#FBFBF9] text-[#4A4A40] hover:bg-[#F5F5F0]/70"
              }`}
              id={`sample-btn-${sample.id}`}
            >
              <div className="font-semibold text-xs truncate">{sample.title}</div>
              <div className="text-[10px] text-[#8A8A7A] line-clamp-1 mt-1">{sample.description}</div>
              {activeSampleId === sample.id && (
                <CheckCircle2 className="w-4 h-4 text-[#5A5A40] absolute top-3.5 right-3.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Textarea */}
        <div id="transcript-input-field">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="transcript" className="block text-sm font-semibold text-[#2C2C24]">
              貼上會議逐字稿 / 重點對話 / 討論筆記
            </label>
            <div className="flex items-center gap-3 text-xs text-[#8A8A7A]">
              {wordCount > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[#5A5A40] hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> 清空內容
                </button>
              )}
              <span>字數統計: <strong className="text-[#4A4A40] font-bold">{wordCount}</strong> 字</span>
            </div>
          </div>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setActiveSampleId(null);
            }}
            placeholder="請在此處貼上、輸入您的會議錄音逐字稿，或是雜亂的討論重點筆記...
或者您可以點擊上方的範本，立即自動載入對話進行體驗！"
            rows={10}
            className="w-full rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] p-4 font-sans text-sm text-[#2C2C24] placeholder-[#A0A090] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#DEDECF]/30 transition-all resize-y shadow-xs min-h-[300px]"
            required
          />
        </div>

        {/* Configuration grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="config-panel-grid">
          {/* Target Language Select */}
          <div className="space-y-2">
            <label htmlFor="target-lang" className="text-sm font-semibold text-[#2C2C24] flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#5A5A40]" />
              目標語系對照翻譯
            </label>
            <select
              id="target-lang"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] p-3 text-sm font-semibold text-[#4A4A40] focus:border-[#5A5A40] focus:outline-hidden focus:ring-4 focus:ring-[#DEDECF]/30 transition-all shadow-2xs cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#8A8A7A]">AI 會專門將總結精要部分翻譯成您選擇的目標語言。</p>
          </div>

          {/* Tone Slider/Selector */}
          <div className="space-y-2">
            <label htmlFor="tone-style" className="text-sm font-[#2C2C24] font-semibold flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#5A5A40]" />
              會議紀錄語氣風格
            </label>
            <div className="grid grid-cols-2 gap-2" id="tone-style-options">
              {tones.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTone(t.name)}
                  className={`px-3 py-2 text-left rounded-xl text-xs border transition-all cursor-pointer ${
                    tone === t.name
                      ? "border-[#5A5A40] bg-[#FDFBF7] text-[#2C2C24] font-bold shadow-2xs"
                      : "border-[#E5E5DF] hover:border-[#DEDECF] text-[#606050] bg-[#FBFBF9]"
                  }`}
                  id={`tone-btn-${t.name}`}
                >
                  <div className="font-bold">{t.name}</div>
                  <div className="text-[9px] text-[#8a8a7a] line-clamp-1 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Sections Checkbox group */}
        <div className="bg-[#FDFBF7] rounded-xl p-4 border border-[#E5E5DF] space-y-3" id="sections-selector-box">
          <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
            生成內容結構 (自由勾選，客製化產出)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="sections-checkboxes">
            {sectionsAvailable.map((sec) => {
              const isChecked = selectedSections.includes(sec.key);
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => handleSectionToggle(sec.key)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isChecked
                      ? "bg-white border-[#5A5A40] shadow-xs text-[#2C2C24]"
                      : "bg-transparent border-[#E5E5DF] text-[#8A8A7A] hover:border-[#DEDECF]"
                  }`}
                  id={`section-checkbox-btn-${sec.key}`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Done via button onClick
                      className="rounded text-[#5A5A40] focus:ring-[#5A5A40] w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{sec.label}</div>
                    <div className="text-[10px] text-[#8A8A7A] mt-0.5">{sec.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedSections.length === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              請至少勾選一項生成結構，否則 AI 可能不會回傳任何內容。
            </div>
          )}
        </div>

        {/* Custom Input Field for extra instructions */}
        <div className="space-y-2" id="custom-instructions-container">
          <label htmlFor="custom-instructions" className="block text-sm font-semibold text-[#2C2C24]">
            額外補充及客製化指令 (選填)
          </label>
          <input
            id="custom-instructions"
            type="text"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="例如：「著重記錄行銷部的開銷預算」、「用英文來寫行動事項項目」或「語氣請活潑幽默一點」..."
            className="w-full rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] px-3.5 py-2.5 text-xs text-[#4A4A40] placeholder-[#A0A090] focus:border-[#5A5A40] focus:outline-hidden focus:ring-4 focus:ring-[#DEDECF]/30 transition-all shadow-2xs"
          />
        </div>

        {/* Submission button */}
        <button
          type="submit"
          disabled={isLoading || !transcript.trim() || selectedSections.length === 0}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-xs transition-all duration-250 flex items-center justify-center gap-2 select-none ${
            isLoading || !transcript.trim() || selectedSections.length === 0
              ? "bg-[#E5E5DF] text-[#A0A090] border border-[#DEDECF] cursor-not-allowed"
              : "bg-[#5A5A40] hover:bg-[#4A4A30] active:scale-98 text-white hover:shadow-md cursor-pointer border border-[#4A4A30]"
          }`}
          id="generate-button"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI 秘書大考驗，正在認真速記中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>開始生成會議總結與翻譯</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
