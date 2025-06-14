export function exportSearchResultsToTXT(
  results: Array<{ pageNumber: number; paragraph: string; matchedKeywords: string[] }>,
  keywords: string[]
): void {
  if (results.length === 0) {
    alert('Nenhum resultado encontrado para exportar.');
    return;
  }

  let content = `RESULTADOS DA BUSCA\n`;
  content += `Palavras-chave: ${keywords.join('; ')}\n`;
  content += `Total de parágrafos encontrados: ${results.length}\n`;
  content += `Data da busca: ${new Date().toLocaleString('pt-BR')}\n`;
  content += `${'='.repeat(80)}\n\n`;

  results.forEach((result, index) => {
    content += `RESULTADO ${index + 1}\n`;
    content += `Página: ${result.pageNumber}\n`;
    content += `Palavras encontradas: ${result.matchedKeywords.join(', ')}\n`;
    content += `${'-'.repeat(40)}\n`;
    content += `${result.paragraph}\n`;
    content += `${'='.repeat(80)}\n\n`;
  });

  content += `\nResumo:\n`;
  content += `- Total de resultados: ${results.length}\n`;
  content += `- Páginas com resultados: ${[...new Set(results.map(r => r.pageNumber))].sort((a, b) => a - b).join(', ')}\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `resultados_busca_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}