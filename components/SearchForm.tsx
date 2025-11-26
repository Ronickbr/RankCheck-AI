import React, { useState, useEffect } from 'react';
import { Search, Globe, List, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (url: string, keywords: string[], competitors: string[]) => void;
  isLoading: boolean;
  initialValues?: { url: string; keywords: string[]; competitors?: string[] } | null;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading, initialValues }) => {
  const [url, setUrl] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [competitorsInput, setCompetitorsInput] = useState('');
  const [showCompetitors, setShowCompetitors] = useState(false);

  // Update form when initialValues changes (e.g. from history selection)
  useEffect(() => {
    if (initialValues) {
      setUrl(initialValues.url);
      setKeywordsInput(initialValues.keywords.join('\n'));
      if (initialValues.competitors && initialValues.competitors.length > 0) {
        setCompetitorsInput(initialValues.competitors.join('\n'));
        setShowCompetitors(true);
      } else {
        setCompetitorsInput('');
        setShowCompetitors(false);
      }
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !keywordsInput) return;

    // Split by new lines or commas and clean up
    const keywords = keywordsInput
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const competitors = competitorsInput
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (keywords.length === 0) return;

    onSubmit(url, keywords, competitors);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            URL do Seu Site
          </label>
          <input
            id="url"
            type="text"
            placeholder="exemplo.com.br"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <List size={16} className="text-emerald-400" />
            Palavras-chaves (uma por linha)
          </label>
          <textarea
            id="keywords"
            rows={4}
            placeholder="seo marketing&#10;agencia digital&#10;como criar um site"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            required
          />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => setShowCompetitors(!showCompetitors)}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors w-full justify-between"
          >
            <div className="flex items-center gap-2">
               <Users size={16} className="text-purple-400" />
               Adicionar Concorrentes (Opcional)
            </div>
            {showCompetitors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showCompetitors && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
               <textarea
                id="competitors"
                rows={3}
                placeholder="concorrente1.com.br&#10;concorrente2.com.br"
                value={competitorsInput}
                onChange={(e) => setCompetitorsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Insira as URLs dos concorrentes que deseja comparar no ranking.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isLoading
              ? 'bg-slate-600 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-lg shadow-blue-900/20'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando SERP...
            </>
          ) : (
            <>
              <Search size={20} />
              Verificar Rankings
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;