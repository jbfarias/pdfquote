export interface SearchResult {
  pageNumber: number;
  paragraph: string;
  matchedKeywords: string[];
}

export interface PDFSearchProps {
  pdfFile: File | null;
  searchKeywords: string;
  onSearchResults: (results: SearchResult[]) => void;
}