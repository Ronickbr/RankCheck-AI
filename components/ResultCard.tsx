import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Loader2, Trophy, Medal, TrendingUp, Users } from 'lucide-react';
import { RankingResult, RankData } from '../services/geminiService';

interface ResultCardProps {
  keyword: string;
  loading: boolean;
  result?: RankingResult;
  error?: string;
}

const RankBadge: React.FC<{ rank: string; isTarget?: boolean }> = ({ rank, isTarget }) => {
  const rankLower = rank.toLowerCase();
  const isFound = !rankLower.includes("não encontrado") && 
                  !rankLower.includes("not found") && 
                  !rankLower.includes("n/a");
  
  const rankNumber = parseInt(rank.replace(/[^0-9]/g, ''), 10);
  
  let style = isTarget ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-slate-800 text-slate-400 border-slate-700";
  
  if (isFound && !isNaN(rankNumber)) {
    if (rankNumber <= 3) {
      style = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    } else if (rankNumber <= 10) {
      style = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    } else {
      style = isTarget 
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-slate-700 text-slate-200 border-slate-600";
    }
  } else {
     style = "bg-slate-800/50 text-slate-500 border-slate-700/50";
  }

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-md border whitespace-nowrap ${style}`}>
      {isFound ? `#${rankNumber}` : '-'}
    </span>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ keyword, loading, result, error }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 animate-pulse flex items-center justify-between">
        <div className="space-y-3 w-full">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
        </div>
        <Loader2 className="animate-spin text-blue-500 ml-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-red-900/50 flex items-start gap-4">
        <AlertCircle className="text-red-500 shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-slate-200 text-lg mb-1">{keyword}</h3>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { targetResult, competitorResults } = result;

  // Determine if target found
  const rankLower = targetResult.rank.toLowerCase();
  const isTargetFound = !rankLower.includes("não encontrado") && 
                        !rankLower.includes("not found");
  
  const targetRankNumber = parseInt(targetResult.rank.replace(/[^0-9]/g, ''), 10);

  let MainIcon = TrendingUp;
  let headerStyle = "border-slate-700/50";
  let iconBg = "bg-slate-700/30 text-slate-500";

  if (isTargetFound && !isNaN(targetRankNumber)) {
    if (targetRankNumber <= 3) {
      MainIcon = Trophy;
      headerStyle = "border-yellow-500/20 shadow-yellow-900/5";
      iconBg = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    } else if (targetRankNumber <= 10) {
      MainIcon = Medal;
      headerStyle = "border-emerald-500/20 shadow-emerald-900/5";
      iconBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    } else {
      MainIcon = TrendingUp;
      headerStyle = "border-blue-500/20 shadow-blue-900/5";
      iconBg = "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  }

  const hasCompetitors = competitorResults && competitorResults.length > 0;

  return (
    <div className={`rounded-xl border bg-slate-800 transition-all duration-300 hover:shadow-xl ${headerStyle}`}>
      <div className="p-5">
        <div className="flex items-start gap-4 w-full">
           <div className={`p-2.5 rounded-lg border backdrop-blur-sm shrink-0 ${iconBg}`}>
               <MainIcon size={24} />
           </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <h3 className="font-bold text-lg text-white truncate pr-2">{keyword}</h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-md border whitespace-nowrap ${
                isTargetFound ? iconBg : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
              }`}>
                {isTargetFound ? `Posição: ${targetResult.rank}` : 'Não encontrado'}
              </span>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mt-2 bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
              {result.summary}
            </p>
            
            {isTargetFound && targetResult.url !== "N/A" && (
                <div className="mt-2 flex items-center gap-2 group">
                   <span className="text-xs text-slate-500 uppercase tracking-wide font-medium shrink-0">Sua URL:</span>
                   <a 
                    href={targetResult.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-400 text-xs truncate hover:text-blue-300 hover:underline transition-colors flex items-center gap-1"
                   >
                       {targetResult.url}
                       <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </a>
                </div>
            )}
          </div>
        </div>

        {/* Competitor Analysis Table */}
        {hasCompetitors && (
          <div className="mt-6 border-t border-slate-700/50 pt-4">
             <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-purple-400" />
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Comparativo de Concorrentes</h4>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                   <tr>
                     <th className="px-3 py-2 rounded-tl-lg">Domínio</th>
                     <th className="px-3 py-2 text-center">Posição</th>
                     <th className="px-3 py-2 rounded-tr-lg">URL Encontrada</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50">
                    {/* User Row - Highlighted */}
                    <tr className="bg-blue-500/5">
                      <td className="px-3 py-2 font-medium text-blue-200">
                        {targetResult.domain} <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded border border-blue-500/30">VOCÊ</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <RankBadge rank={targetResult.rank} isTarget={true} />
                      </td>
                      <td className="px-3 py-2 text-slate-400 truncate max-w-[150px]" title={targetResult.url}>
                        {targetResult.url !== 'N/A' ? (
                          <a href={targetResult.url} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center gap-1">
                            <span className="truncate">{targetResult.url}</span>
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                    
                    {/* Competitors Rows */}
                    {competitorResults.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-3 py-2 text-slate-300 font-medium">{comp.domain}</td>
                        <td className="px-3 py-2 text-center">
                          <RankBadge rank={comp.rank} />
                        </td>
                        <td className="px-3 py-2 text-slate-500 truncate max-w-[150px]" title={comp.url}>
                          {comp.url !== 'N/A' ? (
                            <a href={comp.url} target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
                              <span className="truncate">{comp.url}</span>
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {result.groundingSources && result.groundingSources.length > 0 && (
        <div className="px-5 py-3 bg-slate-900/30 border-t border-slate-700/50 rounded-b-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Fontes Google Search
          </p>
          <div className="flex flex-wrap gap-2">
            {result.groundingSources.slice(0, 5).map((source, idx) => (
              source.web ? (
                <a
                  key={idx}
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-[11px] text-slate-400 hover:text-slate-200 transition-all border border-slate-700 hover:border-slate-600"
                  title={source.web.title}
                >
                  <span className="max-w-[180px] truncate">{source.web.title}</span>
                </a>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;