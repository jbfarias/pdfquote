import React, { useState, useCallback } from 'react';
import { FileText, Search as SearchIcon, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { PDFUploader } from './components/PDFUploader';
import { PDFViewer } from './components/PDFViewer';
import { SearchInterface } from './components/SearchInterface';
import { extractTextFromPDF, findParagraphsWithKeywords } from './utils/textExtraction';
import { exportSearchResultsToTXT } from './utils/exportUtils';

interface SearchResult {
  pageNumber: number;
  paragraph: string;
  matchedKeywords: string[];
}

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleFileSelect = useCallback((file: File) => {
    setPdfFile(file);
    setSearchResults([]);
    setCurrentKeywords([]);
  }, []);

  const handleSearch = useCallback(async (keywords: string[]) => {
    if (!pdfFile) return;

    setIsSearching(true);
    setCurrentKeywords(keywords);

    try {
      const extractedPages = await extractTextFromPDF(pdfFile);
      const results = findParagraphsWithKeywords(extractedPages, keywords);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar no PDF:', error);
      alert('Erro ao processar o PDF. Verifique se o arquivo é válido.');
    } finally {
      setIsSearching(false);
    }
  }, [pdfFile]);

  const handleExport = useCallback(() => {
    exportSearchResultsToTXT(searchResults, currentKeywords);
  }, [searchResults, currentKeywords]);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  const handleReturnToUpload = useCallback(() => {
    setPdfFile(null);
    setSearchResults([]);
    setCurrentKeywords([]);
    setSidebarExpanded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {pdfFile && (
                <button
                  onClick={handleReturnToUpload}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                  title="Voltar para seleção de arquivo"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Voltar</span>
                </button>
              )}
              <div className="flex items-center space-x-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <SearchIcon className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Visualizador e Buscador de PDF
                </h1>
                {pdfFile && (
                  <p className="text-xs text-gray-600">
                    {pdfFile.name} • {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
            {pdfFile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                title={sidebarExpanded ? "Recolher sidebar" : "Expandir sidebar"}
              >
                {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!pdfFile ? (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* PDF Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Carregar PDF
              </h2>
              <PDFUploader onFileSelect={handleFileSelect} selectedFile={pdfFile} />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                Como usar o Visualizador de PDF
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Carregue um PDF</h4>
                    <p>Clique ou arraste um arquivo PDF para começar a análise.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Busque termos</h4>
                    <p>Digite palavras-chave separadas por ";" para encontrar parágrafos relevantes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Exporte resultados</h4>
                    <p>Baixe um arquivo TXT com todos os parágrafos encontrados e suas páginas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Expandable Sidebar */}
            <div 
              className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
                sidebarExpanded ? 'w-80' : 'w-12'
              }`}
            >
              {sidebarExpanded ? (
                <div className="p-4 h-full overflow-y-auto">
                  <SearchInterface
                    onSearch={handleSearch}
                    searchResults={searchResults}
                    onExport={handleExport}
                    isSearching={isSearching}
                  />
                </div>
              ) : (
                <div className="p-2 flex flex-col items-center space-y-4 mt-4">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                  {searchResults.length > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              )}
            </div>

            {/* Main PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <PDFViewer file={pdfFile} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;