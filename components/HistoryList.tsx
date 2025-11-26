import React from 'react';
import { Clock, Trash2, ArrowUpRight, Search, Users } from 'lucide-react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  url: string;
  keywords: string[];
  competitors?: string[];
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Clock size={16} className="text-blue-400" />
          Histórico Recente
        </div>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800"
        >
          <Trash2 size={12} />
          Limpar
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-all group relative group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-blue-400 truncate max-w-[180px] block">
                {item.url}
              </span>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {formatDate(item.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-1.5">
              <Search size={12} className="text-slate-500 shrink-0" />
              <p className="text-xs text-slate-300 truncate w-full">
                {item.keywords.join(", ")}
              </p>
            </div>

            {item.competitors && item.competitors.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Users size={12} className="text-purple-500 shrink-0" />
                <p className="text-[10px] text-purple-400/80 truncate">
                  vs {item.competitors.length} concorrentes
                </p>
              </div>
            )}

            <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={14} className="text-emerald-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;