import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ResultCard from './components/ResultCard';
import HistoryList, { HistoryItem } from './components/HistoryList';
import { checkKeywordRank, RankingResult } from './services/geminiService';
import { BarChart3, Info, Layers, Users } from 'lucide-react';

interface ResultItem {
  keyword: string;
  loading: boolean;
  data?: RankingResult;
  error?: string;
}

const App: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<{url: string, keywords: string[], competitors?: string[]} | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('rankCheckHistory');
    if (saved) {
      try {
        setResults([]); // Start empty
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (url: string, keywords: string[], competitors: string[]) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      url,
      keywords,
      competitors // Save competitors to history
    };

    // Remove identical searches from recent history to avoid clutter
    const filteredHistory = history.filter(h => 
      !(h.url === url && 
        JSON.stringify(h.keywords.sort()) === JSON.stringify(keywords.sort()) &&
        JSON.stringify(h.competitors?.sort() || []) === JSON.stringify(competitors.sort()))
    );

    const newHistory = [newItem, ...filteredHistory].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('rankCheckHistory', JSON.stringify(newHistory));
  };

  const handleHistorySelect = (item: HistoryItem) => {
    // Fill the form
    setSelectedHistory({ 
      url: item.url, 
      keywords: item.keywords,
      competitors: item.competitors
    });
    // Scroll to top mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('rankCheckHistory');
  };

  const handleSearch = async (url: string, keywords: string[], competitors: string[]) => {
    setIsProcessing(true);
    saveToHistory(url, keywords, competitors);
    
    // Initialize results with loading state
    const initialResults: ResultItem[] = keywords.map(k => ({
      keyword: k,
      loading: true
    }));
    setResults(initialResults);

    // Process keywords one by one to avoid rate limits and provide better UX
    // We update the state as each promise resolves
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      
      try {
        const result = await checkKeywordRank(url, keyword, competitors);
        
        setResults(prev => prev.map(item => 
          item.keyword === keyword 
            ? { ...item, loading: false, data: result } 
            : item
        ));
      } catch (err) {
        setResults(prev => prev.map(item => 
          item.keyword === keyword 
            ? { ...item, loading: false, error: "Não foi possível analisar esta palavra-chave. Tente novamente." } 
            : item
        ));
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header & Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                <BarChart3 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                  RankCheck AI
                </h1>
                <p className="text-slate-400 text-sm">Verificador de SERP & Competidores</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl space-y-4 shadow-sm">
               <div className="flex gap-4">
                <div className="bg-blue-500/10 p-2 h-fit rounded-lg">
                    <Layers className="text-blue-400 shrink-0" size={20} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200 text-sm">Deep Search (100+)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Análise profunda de até 10 páginas do Google para encontrar seu site e concorrentes.
                    </p>
                </div>
               </div>
               
               <div className="flex gap-4">
                <div className="bg-purple-500/10 p-2 h-fit rounded-lg">
                    <Users className="text-purple-400 shrink-0" size={20} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200 text-sm">Análise Competitiva</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Compare sua posição diretamente com até 3-5 concorrentes na mesma busca.
                    </p>
                </div>
               </div>
            </div>

            <SearchForm 
              onSubmit={handleSearch} 
              isLoading={isProcessing} 
              initialValues={selectedHistory}
            />
            
            <HistoryList 
              history={history} 
              onSelect={handleHistorySelect} 
              onClear={clearHistory}
            />

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <Info size={12} />
                Como funciona
              </div>
              <p className="text-xs text-slate-500">
                O sistema utiliza a Grounding do Google Search via Gemini 2.5 Flash para varrer os resultados de busca em tempo real e identificar a posição exata da sua URL e de seus concorrentes.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area - Results */}
        <div className="lg:col-span-8">
          {results.length === 0 ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700/50 p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-slate-700 z-10">
                <BarChart3 size={48} className="text-slate-600 group-hover:text-blue-400 transition-colors duration-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-200 mb-3 z-10">Pronto para Analisar</h2>
              <p className="text-slate-400 max-w-md leading-relaxed z-10">
                Insira a URL do seu site, palavras-chave e (opcionalmente) concorrentes. O sistema fará uma varredura completa para comparar seu desempenho.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                    <h2 className="text-xl font-bold text-white">Resultados da Análise</h2>
                    <p className="text-xs text-slate-400 mt-1">Verificação em tempo real via Google Search Grounding</p>
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">
                  {results.filter(r => r.loading).length > 0 
                    ? `Processando ${results.filter(r => r.loading).length}...` 
                    : `Concluído (${results.length} palavras)`
                  }
                </div>
              </div>
              
              <div className="grid gap-4">
                {results.map((item, index) => (
                  <ResultCard 
                    key={`${item.keyword}-${index}`}
                    keyword={item.keyword}
                    loading={item.loading}
                    result={item.data}
                    error={item.error}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;