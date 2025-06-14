import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedText {
  pageNumber: number;
  text: string;
  items: TextItem[];
}

export async function extractTextFromPDF(file: File): Promise<ExtractedText[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const extractedPages: ExtractedText[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .filter((item): item is any => 'str' in item)
      .map(item => item.str)
      .join(' ');

    extractedPages.push({
      pageNumber: pageNum,
      text: pageText,
      items: textContent.items.filter((item): item is any => 'str' in item)
    });
  }

  return extractedPages;
}

export function findParagraphsWithKeywords(
  extractedPages: ExtractedText[],
  keywords: string[]
): Array<{ pageNumber: number; paragraph: string; matchedKeywords: string[] }> {
  const results: Array<{ pageNumber: number; paragraph: string; matchedKeywords: string[] }> = [];
  
  extractedPages.forEach(page => {
    // Split text into paragraphs (using multiple line breaks as delimiter)
    const paragraphs = page.text
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map(p => p.trim())
      .filter(p => p.length > 20); // Filter out very short paragraphs

    paragraphs.forEach(paragraph => {
      const matchedKeywords: string[] = [];
      const lowerParagraph = paragraph.toLowerCase();
      
      keywords.forEach(keyword => {
        if (lowerParagraph.includes(keyword.toLowerCase().trim())) {
          matchedKeywords.push(keyword.trim());
        }
      });

      // If all keywords are found in the paragraph, add to results
      if (matchedKeywords.length === keywords.length) {
        results.push({
          pageNumber: page.pageNumber,
          paragraph,
          matchedKeywords
        });
      }
    });
  });

  return results;
}