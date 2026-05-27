import React, { useState } from "react";
import { MeetingRecord } from "../types";
import { History, Calendar, Trash2, Search, ArrowRight, AlertCircle } from "lucide-react";

interface HistoryListProps {
  records: MeetingRecord[];
  activeRecordId: string | null;
  onSelectRecord: (record: MeetingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryList({
  records,
  activeRecordId,
  onSelectRecord,
  onDeleteRecord,
  onClearAll
}: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs p-5 md:p-6 flex flex-col h-full" id="history-sidebar-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5DF]" id="hist-header">
        <div className="flex items-center gap-1.5 font-bold text-[#2C2C24] text-sm">
          <History className="w-4 h-4 text-[#5A5A40] animate-pulse" />
          <span>歷史存檔與對照記錄</span>
          <span className="text-xs bg-[#EFEFEA] text-[#5A5A40] px-2 py-0.5 rounded-full font-bold border border-[#DEDECF]">
            {records.length}
          </span>
        </div>
        {records.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("確定要清空所有歷史會議記錄嗎？這項操作無法復原。")) {
                onClearAll();
              }
            }}
            className="text-[11px] text-[#8A8A7A] hover:text-red-600 font-semibold transition-colors cursor-pointer"
            id="clear-all-history-btn"
          >
            清空全部
          </button>
        )}
      </div>

      {/* Search Input */}
      {records.length > 0 && (
        <div className="relative mb-4" id="history-search-container">
          <Search className="w-3.5 h-3.5 text-[#8A8A7A] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋歷史會議標題..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#E5E5DF] bg-[#FBFBF9] pl-8 pr-3 py-2 text-xs text-[#2C2C24] placeholder-[#A0A090] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-[#DEDECF]/30 transition-all shadow-xs"
          />
        </div>
      )}

      {/* Record list container */}
      <div className="space-y-2.5 overflow-y-auto max-h-[360px] flex-1 pr-1" id="history-feed-scroller">
        {records.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center text-[#8A8A7A]" id="history-empty">
            <AlertCircle className="w-8 h-8 text-[#A0A090] mb-2" />
            <div className="text-xs font-semibold text-[#2C2C24]">尚無歷史會議存檔</div>
            <p className="text-[10px] text-[#8A8A7A] max-w-[220px] mt-1 leading-relaxed">
              由 AI 整理出來的會議記錄，將會自動在此處進行暫存方便檢閱。
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8A8A7A]">
            找不到符合「{searchTerm}」的會議紀錄。
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r.id}
              className={`p-3 rounded-xl border transition-all text-left flex justify-between items-center group relative cursor-pointer ${
                activeRecordId === r.id
                  ? "border-[#5A5A40] bg-[#FDFBF7] text-[#2C2C24] font-bold shadow-xs"
                  : "border-[#E5E5DF] hover:border-[#DEDECF] bg-white text-[#4A4A40] hover:bg-[#F5F5F0]/50"
              }`}
              onClick={() => onSelectRecord(r)}
              id={`history-item-${r.id}`}
            >
              <div className="flex-1 min-w-0 pr-3">
                {/* Title */}
                <h4 className="text-xs font-semibold truncate text-[#2C2C24] tracking-tight">
                  {r.title}
                </h4>
                {/* Metadata row */}
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8A8A7A] font-semibold">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {r.date}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecord(r.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-red-50 text-[#A0A090] hover:text-red-650 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="刪除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-[#A0A090] group-hover:text-[#5A5A40] transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
