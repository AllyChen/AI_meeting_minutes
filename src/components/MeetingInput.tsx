import React, { useState } from "react";
import { GenerationConfig } from "../types";
import { Sparkles, RotateCcw } from "lucide-react";

interface MeetingInputProps {
  onGenerate: (config: GenerationConfig) => void;
  isLoading: boolean;
}

export default function MeetingInput({ onGenerate, isLoading }: MeetingInputProps) {
  const [transcript, setTranscript] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");


  const handleClear = () => {
    setTranscript("");
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
      customInstruction
    });
  };

  const wordCount = transcript.trim() ? transcript.trim().length : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs p-6 md:p-8" id="meeting-input-container">
      {/* Sample presets panel */}

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
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="請在此處貼上或輸入您的會議逐字稿、討論重點或會議紀錄..."
            rows={10}
            className="w-full rounded-2xl border border-[#E5E5DF] bg-[#FBFBF9] p-4 font-sans text-sm text-[#2C2C24] placeholder-[#A0A090] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#DEDECF]/30 transition-all resize-y shadow-xs min-h-[300px]"
            required
          />
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
          disabled={isLoading || !transcript.trim()}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-xs transition-all duration-250 flex items-center justify-center gap-2 select-none ${
            isLoading || !transcript.trim()
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
              <span>開始生成會議總結</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
