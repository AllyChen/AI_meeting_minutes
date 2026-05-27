import React, { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Download, FileJson, Sparkles, BookOpen, Terminal, Eye, FileDown } from "lucide-react";

interface MeetingOutputProps {
  processedText: string | null;
  isLoading: boolean;
  activeLoadingStep: number;
}

export default function MeetingOutput({ processedText, isLoading, activeLoadingStep }: MeetingOutputProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  const loadingSteps = [
    "AI 秘書已收到逐字稿，開始語意斷句分析...",
    "正在過濾口頭禪、廢話，梳理會議主幹議題與關鍵對策...",
    "正在精確提取各部門的行動項目與責任歸屬...",
    "進行中，AI 專家正在整理成條理清晰的會議摘要...",
    "排版收尾中，準備為您呈現最精美的結構化會議文檔..."
  ];

  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!processedText) return;
    const blob = new Blob([processedText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `會議記錄_${today}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden" id="loading-state-box">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E5E5DF]">
          <div 
            className="h-full bg-[#5A5A40] transition-all duration-500 ease-out" 
            style={{ width: `${((activeLoadingStep + 1) / loadingSteps.length) * 100}%` }}
          />
        </div>

        <div className="mb-6 relative">
          <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-[#5A5A40] animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#E5E5DF] animate-ping opacity-25" />
        </div>

        <h3 className="text-lg font-bold text-[#2C2C24] mb-2">AI 智能分析中</h3>
        <p className="text-sm text-[#8A8A7A] max-w-sm text-center mb-8 h-10 flex items-center justify-center font-medium">
          {loadingSteps[activeLoadingStep] || "正在努力整理，請稍候..."}
        </p>

        {/* Pseudo progression blocks */}
        <div className="flex gap-2 w-full max-w-xs justify-center">
          {loadingSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeLoadingStep
                  ? "w-8 bg-[#5A5A40]"
                  : idx < activeLoadingStep
                  ? "w-3 bg-[#8A8A7A]"
                  : "w-3 bg-[#E5E5DF]"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!processedText) {
    return (
      <div className="bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-[#E5E5DF] p-8 flex flex-col items-center justify-center text-center min-h-[450px]" id="empty-state-box">
        <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5DF] flex items-center justify-center text-[#8A8A7A] mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#2C2C24] mb-1">等待生成會議記錄</h3>
        <p className="text-xs text-[#8A8A7A] max-w-xs leading-relaxed">
          請在左側貼上您的會議文字，點擊「開始生成會議總結」按鈕，AI 將會快速整理出精準的會議記錄。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs flex flex-col overflow-hidden min-h-[450px]" id="output-rendered-box">
      {/* Header bar */}
      <div className="px-6 py-4 bg-[#FDFBF7] border-b border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#5A5A40]" />
          <h2 className="text-sm font-bold text-[#2C2C24]">AI 整理會議報告</h2>
          <span className="text-[10px] bg-[#EFEFEA] text-[#5A5A40] px-2 py-0.5 rounded-full font-bold border border-[#DEDECF]">生成成功</span>
        </div>

        {/* Controllers */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DF] text-xs text-[#5A5A40]">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "preview" ? "bg-white text-[#2C2C24] font-bold shadow-2xs" : "hover:text-[#2C2C24]"
              }`}
              id="view-preview-btn"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>排版預覽</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "raw" ? "bg-white text-[#2C2C24] font-bold shadow-2xs" : "hover:text-[#2C2C24]"
              }`}
              id="view-raw-btn"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>原始碼</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#E5E5DF] mx-1" />

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer select-none ${
              copied
                ? "bg-[#EFEFEA] border-[#DEDECF] text-[#5A5A40]"
                : "bg-white border-[#E5E5DF] hover:bg-[#F5F5F0] text-[#4A4A40]"
            }`}
            title="複製全部內容"
            id="copy-text-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "已複製" : "複製內容"}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadMarkdown}
            className="p-2 rounded-lg border border-[#E5E5DF] bg-white text-[#4A4A40] hover:bg-[#F5F5F0] transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer select-none"
            title="下載 Markdown 檔案"
            id="download-md-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">下載檔</span>
          </button>
        </div>
      </div>

      {/* Main output page body */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[650px] prose prose-stone" id="output-scroll-container">
        {viewMode === "raw" ? (
          <pre className="font-mono text-xs text-[#4A4A40] bg-[#FBFBF9] p-4 rounded-xl border border-[#E5E5DF] whitespace-pre-wrap leading-relaxed select-text">
            {processedText}
          </pre>
        ) : (
          <div className="text-[#4A4A40] leading-relaxed space-y-4 select-text">
            <Markdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-base md:text-lg font-bold text-[#2C2C24] border-b border-[#E5E5DF] pb-2 mt-5 mb-4 font-sans tracking-tight" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xs md:text-sm font-bold text-[#2C2C24] pb-1 mt-4 mb-3 font-sans tracking-tight border-l-2 border-[#5A5A40] pl-2" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-xs font-semibold text-[#2C2C24] mt-3 mb-2 font-sans" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="text-xs md:text-sm text-[#4A4A40] leading-relaxed my-2" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1 text-xs md:text-sm text-[#4A4A40]" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1 text-xs md:text-sm text-[#4A4A40]" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="text-xs md:text-sm text-[#4A4A40]" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-[#5A5A40] bg-[#FDFBF7] pl-3.5 py-2 pr-2 my-3 rounded-r-lg italic text-xs md:text-sm text-[#5A5A50]" {...props} />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-[#E5E5DF]">
                    <table className="min-w-full divide-y divide-[#E5E5DF] text-[11px] md:text-xs text-left" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-[#FDFBF7] font-bold text-[#2C2C24] uppercase" {...props} />
                ),
                tbody: ({ ...props }) => (
                  <tbody className="divide-y divide-[#E5E5DF]/40 bg-white" {...props} />
                ),
                tr: ({ ...props }) => (
                  <tr className="hover:bg-[#F5F5F0]/30 transition-colors" {...props} />
                ),
                th: ({ ...props }) => (
                  <th className="px-3.5 py-2.5 font-semibold text-[#2C2C24] border-b border-[#E5E5DF]" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="px-3.5 py-2.5 text-[#4A4A40] border-b border-[#E5E5DF]/40" {...props} />
                ),
              }}
            >
              {processedText}
            </Markdown>
          </div>
        )}
      </div>

      {/* Tiny helper footer */}
      <div className="px-6 py-3 bg-[#FDFBF7] text-[10px] text-[#8A8A7A] border-t border-[#E5E5DF] flex items-center justify-between">
        <span>💡 提示：您可以切換「原始碼」以單純複製 Markdown 核心架構。</span>
        <span>智議 AI 助手 v1.0</span>
      </div>
    </div>
  );
}
