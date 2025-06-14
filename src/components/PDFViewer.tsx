import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [fitToWidth, setFitToWidth] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(3.0, prev + 0.25));
    setFitToWidth(false);
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(0.3, prev - 0.25));
    setFitToWidth(false);
  }, []);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const toggleFitToWidth = useCallback(() => {
    setFitToWidth(prev => !prev);
    if (!fitToWidth) {
      setScale(1.0);
    }
  }, [fitToWidth]);

  const resetZoom = useCallback(() => {
    setScale(1.0);
    setFitToWidth(false);
  }, []);

  // Predefined zoom levels
  const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
  const setZoomLevel = useCallback((level: number) => {
    setScale(level);
    setFitToWidth(false);
  }, []);

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">
            {numPages ? `${numPages} páginas` : 'Carregando...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.3}
            className="p-1.5 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-3 w-3" />
          </button>

          {/* Zoom Level Dropdown */}
          <select
            value={fitToWidth ? 'fit' : scale}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'fit') {
                toggleFitToWidth();
              } else {
                setZoomLevel(parseFloat(value));
              }
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fit">Ajustar largura</option>
            {zoomLevels.map(level => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>

          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-3 w-3" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Rotate */}
          <button
            onClick={rotate}
            className="p-1.5 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
            title="Rotacionar 90°"
          >
            <RotateCw className="h-3 w-3" />
          </button>

          {/* Fit to Width */}
          <button
            onClick={toggleFitToWidth}
            className={`p-1.5 rounded transition-colors duration-200 ${
              fitToWidth 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title="Ajustar à largura"
          >
            <Maximize2 className="h-3 w-3" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
            title="Resetar zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* PDF Document - Continuous Scroll */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="flex justify-center py-4">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando PDF...</span>
              </div>
            }
            error={
              <div className="text-red-600 text-center py-20">
                <p className="text-lg font-semibold mb-2">Erro ao carregar o PDF</p>
                <p className="text-sm">Verifique se o arquivo é válido e tente novamente.</p>
              </div>
            }
          >
            <div className="space-y-4">
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="relative">
                  {/* Page Number Indicator */}
                  <div className="absolute -top-2 left-0 bg-blue-600 text-white px-2 py-1 rounded-t text-xs font-medium z-10">
                    Página {index + 1}
                  </div>
                  <Page
                    pageNumber={index + 1}
                    scale={fitToWidth ? undefined : scale}
                    width={fitToWidth ? Math.min(window.innerWidth - 400, 1200) : undefined}
                    rotate={rotation}
                    className="border border-gray-300 bg-white shadow-lg"
                    loading={
                      <div className="flex items-center justify-center py-10 bg-gray-50 border border-gray-300">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 text-sm">Carregando página {index + 1}...</span>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
}