import React, { useState, useCallback } from 'react';
import { Search, Download, AlertCircle, FileText } from 'lucide-react';

interface SearchResult {
  pageNumber: number;
  paragraph: string;
  matchedKeywords: string[];
}

interface SearchInterfaceProps {
  onSearch: (keywords: string[]) => void;
  searchResults: SearchResult[];
  onExport: () => void;
  isSearching: boolean;
}

export function SearchInterface({ onSearch, searchResults, onExport, isSearching }: SearchInterfaceProps) {
  const [keywords, setKeywords] = useState('');

  const handleSearch = useCallback(() => {
    if (!keywords.trim()) {
      alert('Por favor, digite pelo menos uma palavra-chave.');
      return;
    }

    const keywordArray = keywords
      .split(';')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordArray.length === 0) {
      alert('Por favor, digite palavras-chave válidas.');
      return;
    }

    onSearch(keywordArray);
  }, [keywords, onSearch]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const highlightKeywords = (text: string, keywords: string[]) => {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    return highlightedText;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search Input */}
      <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-3">
          <Search className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Buscar no PDF</h2>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite as palavras-chave separadas por ;"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            rows={2}
            disabled={isSearching}
          />
          <p className="text-xs text-gray-500">
            Exemplo: "inteligência artificial; machine learning"
          </p>
          
          <button
            onClick={handleSearch}
            disabled={!keywords.trim() || isSearching}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <button
                onClick={onExport}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 text-xs"
              >
                <Download className="h-3 w-3" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {searchResults.map((result, index) => (
              <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Página {result.pageNumber}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <p
                  className="text-gray-700 leading-relaxed text-xs"
                  dangerouslySetInnerHTML={{
                    __html: highlightKeywords(result.paragraph, result.matchedKeywords)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!isSearching && searchResults.length === 0 && keywords && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900 text-xs">Nenhum resultado encontrado</h3>
            <p className="text-xs text-yellow-700 mt-1">
              Tente usar palavras-chave diferentes ou verifique a ortografia.
            </p>
          </div>
        </div>
      )}

      {/* Search Tips */}
      {!keywords && !isSearching && searchResults.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="font-medium text-blue-900 text-xs mb-2">Dicas de busca:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use ";" para separar múltiplas palavras-chave</li>
            <li>• Todas as palavras devem estar no mesmo parágrafo</li>
            <li>• A busca não diferencia maiúsculas de minúsculas</li>
          </ul>
        </div>
      )}
    </div>
  );
}